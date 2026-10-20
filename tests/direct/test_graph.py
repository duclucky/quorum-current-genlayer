"""Pure deterministic graph tests also run without mocking the storage SDK."""
import ast
import itertools
from pathlib import Path


def resolver():
    tree = ast.parse(Path("contracts/quorum_current.py").read_text(encoding="ascii"))
    node = next(n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name == "resolve")
    scope = {}
    exec(compile(ast.Module(body=[node], type_ignores=[]), "resolver", "exec"), scope)
    return scope["resolve"]


def test_transitive_origins_conserve_three_voices():
    result = resolver()([1, 2, 2], ["NO", "NO", "YES"], ["APPLIES", "APPLIES", "DIRECT"])
    assert result["yes"] == 3
    assert result["no"] == result["abstain"] == 0
    assert [o["root"] for o in result["origins"]] == [2, 2, 2]
    assert result["origins"][0]["path"] == [0, 1, 2]


def test_cycle_and_inbound_origin_abstain_without_reassigning():
    result = resolver()([1, 0, 0], ["YES", "YES", "YES"], ["APPLIES"] * 3)
    assert result["abstain"] == 3
    assert result["yes"] == result["no"] == 0
    assert all(o["root"] == -1 for o in result["origins"])


def test_out_of_scope_falls_back_to_own_ballot():
    result = resolver()([1, 1, 1], ["NO", "YES", "NO"], ["NOT_APPLICABLE", "DIRECT", "APPLIES"])
    assert (result["yes"], result["no"], result["abstain"]) == (2, 1, 0)
    assert result["origins"][0]["root"] == 0


def test_all_bounded_graphs_match_independent_fixed_point_reference():
    fn = resolver()
    checked = 0
    for targets in itertools.product(range(3), repeat=3):
        for active in itertools.product([False, True], repeat=3):
            labels = ["DIRECT" if targets[i] == i else "APPLIES" if active[i] else "NOT_APPLICABLE" for i in range(3)]
            for ballots in itertools.product(["YES", "NO"], repeat=3):
                # Propagate known direct roots until no further origin resolves.
                roots = {i: i for i in range(3) if labels[i] != "APPLIES"}
                for _ in range(3):
                    for i in range(3):
                        if i not in roots and targets[i] in roots:
                            roots[i] = roots[targets[i]]
                expected = [ballots[roots[i]] if i in roots else "ABSTAIN" for i in range(3)]
                result = fn(list(targets), list(ballots), labels)
                assert [o["vote"] for o in result["origins"]] == expected
                assert result["yes"] + result["no"] + result["abstain"] == 3
                assert [o["member"] for o in result["origins"]] == [0, 1, 2]
                checked += 1
    assert checked == 1728
