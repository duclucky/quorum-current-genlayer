"""Real direct SDK with scoped Windows file-handle and v0.3 transport fixes."""
import os
import tempfile
from pathlib import Path
import pytest
from gltest.direct import loader, wasi_mock
from gltest.direct.vm import VMContext

os.environ["GENVM_VERSION"] = "v0.6.0-rc5"
llm_request = wasi_mock._handle_llm_request

def llm_wire(vm, data):
    response = vm._match_llm_mock(data.get("prompt", ""))
    return {"ok": response} if response is not None else llm_request(vm, data)

wasi_mock._handle_llm_request = llm_wire

if os.name == "nt":
    cleanup_original = VMContext._cleanup_after_deactivate
    def inject(vm):
        from genlayer import calldata
        from genlayer.types import Address
        message = vm.get_message_raw()
        for key in ("contract_address", "sender_address", "origin_address"):
            if isinstance(message[key], bytes):
                message[key] = Address(message[key])
        encoded = calldata.encode(message)
        fd, path = tempfile.mkstemp()
        try:
            os.write(fd, encoded)
            os.lseek(fd, 0, os.SEEK_SET)
            vm._original_stdin_fd = os.dup(0)
            os.dup2(fd, 0)
            vm._qc_stdin_path = path
        finally:
            os.close(fd)
    def cleanup(vm):
        try:
            cleanup_original(vm)
        finally:
            path = getattr(vm, "_qc_stdin_path", None)
            if path:
                os.unlink(path)
                vm._qc_stdin_path = None
    loader._inject_message_to_fd0 = inject
    VMContext._cleanup_after_deactivate = cleanup

original_load = loader._load_module
def fresh(path):
    import genlayer.contract as api
    api.__known_contract__ = None
    return original_load(path)
loader._load_module = fresh

@pytest.fixture
def direct_deploy(direct_vm):
    def deploy():
        return loader.deploy_contract(Path("contracts/quorum_current.py").resolve(), direct_vm, sdk_version="v0.6.0-rc5")
    return deploy
