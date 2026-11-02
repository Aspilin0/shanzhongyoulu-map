# Compatibility entry point. Geometry is maintained only in build-atlas.py.
from pathlib import Path
import runpy
runpy.run_path(str(Path(__file__).with_name('build-atlas.py')), run_name='__main__')
