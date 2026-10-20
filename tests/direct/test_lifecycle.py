import json
from datetime import datetime, timezone
import pytest

GEN = 10**18
START = 1900000000

def clock(vm, timestamp):
    import genlayer as gl
    stamp = datetime.fromtimestamp(timestamp, timezone.utc).isoformat()
    vm.warp(stamp)
    gl.message.raw["datetime"] = stamp

@pytest.fixture
def council(direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie):
    c = direct_deploy()
    from genlayer.types import Address
    actors = [a if isinstance(a, Address) else Address(a) for a in (direct_alice, direct_bob, direct_charlie)]
    vm = direct_vm
    clock(vm, START)
    vm.sender = actors[0]
    vm.value = 2*GEN
    c.create_decision("alpha", "Monitoring", "Authorize anonymous monitoring aggregates.", *actors, actors[1], START+100, START+200)
    vm.value = 0
    return c, vm, actors

def state(c):
    return c.get_decision("alpha"), c.get_accounting(), tuple(c.get_member("alpha", i) for i in range(3))

def records(c, vm, actors, targets=(1,2,2), votes=("NO","NO","YES")):
    d = json.loads(c.get_decision("alpha"))
    for i,a in enumerate(actors):
        vm.sender = a
        c.record_member("alpha", d["digest"], targets[i], "Monitoring only" if targets[i] != i else "", votes[i])
    clock(vm, START+100)

def mock(vm, labels=("APPLIES","APPLIES")):
    vm.clear_mocks()
    vm.mock_llm(".*", json.dumps({"members":[{"id": i,"label":v} for i,v in enumerate(labels)]}))

def test_real_storage_cascade_grant(council):
    c,vm,actors=council
    records(c,vm,actors)
    mock(vm)
    c.review("alpha")
    d=json.loads(c.get_decision("alpha"))
    assert (d["status"],d["yes"],d["no"],d["abstain"]) == ("APPROVED",3,0,0)
    assert int(c.get_credit(actors[1])) == 2*GEN
    assert json.loads(c.get_resolution("alpha"))[0]["path"] == [0,1,2]
    assert json.loads(c.get_accounting()) == {"received":str(2*GEN),"locked":"0","credits":str(2*GEN),"withdrawn":"0"}

@pytest.mark.parametrize("value",[0,GEN,3*GEN])
def test_wrong_purse_unchanged(council,value):
    c,vm,actors=council
    before=state(c);vm.value=value
    with vm.expect_revert("2 GEN"):
        c.create_decision("beta","Other","Other objective",*actors,actors[1],START+100,START+200)
    assert state(c)==before

@pytest.mark.parametrize("delta",[-1,0,1])
def test_record_boundary_stale_phase(council,delta):
    c,vm,actors=council
    clock(vm,START+100+delta);vm.sender=actors[1]
    d=json.loads(c.get_decision("alpha"));before=state(c)
    if delta<0:
        c.record_member("alpha",d["digest"],1,"","YES")
        assert json.loads(c.get_member("alpha",1))["recorded"] is True
    else:
        with vm.expect_revert("closed"):
            c.record_member("alpha",d["digest"],1,"","YES")
        assert state(c)==before

@pytest.mark.parametrize("at,allowed",[(99,False),(100,True),(101,True),(199,True),(200,False),(201,False)])
def test_review_both_temporal_boundaries(council,at,allowed):
    c,vm,actors=council;records(c,vm,actors);clock(vm,START+at);mock(vm);before=state(c)
    if allowed:
        c.review("alpha");assert json.loads(c.get_decision("alpha"))["status"]=="APPROVED"
    else:
        with vm.expect_revert("window"):c.review("alpha")
        assert state(c)==before

@pytest.mark.parametrize("count",[0,1,2])
@pytest.mark.parametrize("delta",[-1,0,1])
def test_partial_recovery_boundary_and_ledger(council,count,delta):
    c,vm,actors=council
    d=json.loads(c.get_decision("alpha"))
    for i in range(count):
        vm.sender=actors[i];c.record_member("alpha",d["digest"],i,"","YES")
    vm.sender=actors[0];clock(vm,START+200+delta);before=state(c)
    if delta<0:
        with vm.expect_revert("not open"):c.recover("alpha")
        assert state(c)==before
    else:
        c.recover("alpha");assert c.get_credit(actors[0])==str(2*GEN)
        assert json.loads(c.get_decision("alpha"))["escrow"]=="0"
        with vm.expect_revert("unsettled"):c.recover("alpha")
        assert c.get_credit(actors[0])==str(2*GEN)

def test_wrong_actor_digest_and_duplicate_record_unchanged(council):
    c,vm,actors=council
    from genlayer.types import Address
    d=json.loads(c.get_decision("alpha"));before=state(c)
    vm.sender=Address(bytes.fromhex("99"*20))
    with vm.expect_revert("registered"):c.record_member("alpha",d["digest"],1,"Monitoring","YES")
    assert state(c)==before
    vm.sender=actors[0]
    with vm.expect_revert("digest"):c.record_member("alpha","0"*64,1,"Monitoring","YES")
    assert state(c)==before
    c.record_member("alpha",d["digest"],1,"Monitoring","YES");before=state(c)
    with vm.expect_revert("already"):c.record_member("alpha",d["digest"],1,"Monitoring","NO")
    assert state(c)==before

def test_cycle_abstention_refunds_actual_sponsor(council):
    c,vm,actors=council;records(c,vm,actors,(1,0,0),("YES",)*3);mock(vm,("APPLIES",)*3)
    c.review("alpha");d=json.loads(c.get_decision("alpha"))
    assert (d["status"],d["yes"],d["abstain"])==("REJECTED",0,3)
    assert c.get_credit(actors[0])==str(2*GEN)

def test_unclear_three_attempts_remain_recoverable(council):
    c,vm,actors=council;records(c,vm,actors);mock(vm,("UNCLEAR","APPLIES"))
    for i in range(3):
        c.review("alpha");d=json.loads(c.get_decision("alpha"))
        assert d["status"]=="RETRYABLE" and d["attempts"]==i+1 and d["escrow"]==str(2*GEN)
        assert json.loads(c.get_accounting())["credits"]=="0"
    before=state(c)
    with vm.expect_revert("reviewable"):c.review("alpha")
    assert state(c)==before
    vm.sender=actors[0];clock(vm,START+200);c.recover("alpha")
    assert c.get_credit(actors[0])==str(2*GEN)

def test_validator_replays_meaning_and_rejects_nonreturn(council):
    c,vm,actors=council;records(c,vm,actors);mock(vm);c.review("alpha")
    assert vm.run_validator() is True
    assert vm.run_validator(leader_error="source unavailable") is False
    assert vm.run_validator(leader_result=["APPLIES", "APPLIES", "APPLIES"]) is False
    mock(vm,("NOT_APPLICABLE","APPLIES"))
    assert vm.run_validator() is False

def test_recovery_and_close_cannot_be_forced_by_non_sponsor(council):
    c,vm,actors=council;clock(vm,START+200);vm.sender=actors[1];before=state(c)
    with vm.expect_revert("sponsor"):c.recover("alpha")
    with vm.expect_revert("sponsor"):c.close("alpha")
    assert state(c)==before
    vm.sender=actors[0];c.recover("alpha");before=state(c)
    with vm.expect_revert("zero liability"):c.close("alpha")
    assert state(c)==before
