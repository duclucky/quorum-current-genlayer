import ast
from pathlib import Path

SOURCE=Path("contracts/quorum_current.py").read_bytes()

def test_ascii_pinned_header_one_project_contract_and_payability():
    assert SOURCE.isascii()
    source=SOURCE.decode("ascii")
    assert source.splitlines()[:2]==['# v0.3.0','# { "Depends": "py-genlayer:5jycge4q8k23462jtb0b9fyey1s9qz928sz2nbrd9mg4sxqg2qng" }']
    tree=ast.parse(source)
    contracts=[n for n in tree.body if isinstance(n,ast.ClassDef) and any(ast.unparse(b)=="gl.contract.Contract" for b in n.bases)]
    assert [c.name for c in contracts]==["QuorumCurrent"]
    methods={n.name:[ast.unparse(d) for d in n.decorator_list] for n in contracts[0].body if isinstance(n,ast.FunctionDef)}
    assert methods["create_decision"]==["gl.public.write.payable"]
    for name in ("record_member","review","recover","withdraw","close"):
        assert methods[name]==["gl.public.write"]
    assert source.count("gl.message.value")==1
    assert "gl.chain.Account" not in source
    assert "@gl.evm.contract_interface" in source
