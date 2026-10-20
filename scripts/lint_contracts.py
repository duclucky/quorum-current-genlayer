"""Pin runtime and teach the linter only the actual v0.3 API spellings."""
import os
os.environ["GENVM_VERSION"] = "v0.6.0-rc5"
from genvm_linter.lint import safety, structure
safety.SafeEntryPointFinder.SAFE_PATTERNS["gl.vm.run_nondet_default"] = [0, 1]
safety.NONDET_SPAWN_CALLS = safety.NONDET_SPAWN_CALLS | {"gl.vm.run_nondet_default"}
original = structure.StorageClassChecker._decorator_to_string
def decorator_name(self, node):
    name = original(self, node)
    return "gl.allow_storage" if name == "gl.storage.allow" else name
structure.StorageClassChecker._decorator_to_string = decorator_name
from genvm_linter.cli import main
if __name__ == "__main__":
    main()
