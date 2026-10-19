#!/usr/bin/env python3
"""Compatibility entry point for the active six-whole-state contract."""
import runpy
from pathlib import Path
runpy.run_path(str(Path(__file__).with_name('check_dialogue_states.py')),run_name='__main__')
