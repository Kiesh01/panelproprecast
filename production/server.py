#!/usr/bin/env python3
"""
Panelpro Precast & Logistics Ltd - Production & Defect Monitoring System
Root Entry Point for Deployment / Visual Studio / Terminal Execution
Works seamlessly with: python3 server.py  or  python server.py
"""
import os
import sys
import importlib.util

root_dir = os.path.dirname(os.path.abspath(__file__))
python_dir = os.path.join(root_dir, "python")
if python_dir not in sys.path:
    sys.path.insert(0, python_dir)

# Safely load python/server.py directly to avoid circular name collision with root server.py
server_path = os.path.join(python_dir, "server.py")
spec = importlib.util.spec_from_file_location("castops_backend", server_path)
if spec and spec.loader:
    castops_backend = importlib.util.module_from_spec(spec)
    sys.modules["castops_backend"] = castops_backend
    spec.loader.exec_module(castops_backend)
    app = castops_backend.app
    find_open_port = castops_backend.find_open_port
else:
    raise RuntimeError(f"Could not load backend server from {server_path}")

if __name__ == "__main__":
    env_port = os.getenv("PORT") or os.getenv("PYTHON_PORT")
    preferred = int(env_port) if env_port else 5050
    port = find_open_port(preferred)

    print("=" * 70)
    print(" Panelpro Precast & Logistics Ltd - Production & Defect Monitoring System")
    print(" Standalone Edition: Pure HTML/CSS/JS + Python Flask")
    print("=" * 70)
    print(" * Connected to MongoDB: cluster0.nnvvp7x.mongodb.net (Panelpro.Stats)")
    print(f" * Dashboard URL:        http://127.0.0.1:{port}  or  http://localhost:{port}")
    print(" * Shift Schedule:      Mon - Sat: 07:30 to 17:00 (Sunday Maintenance)")
    print(" * Open this URL in your browser to view the application.")
    print(" * Press Ctrl+C in terminal to stop.")
    print("=" * 70)
    app.run(host="0.0.0.0", port=port, debug=False)
