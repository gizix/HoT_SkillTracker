# -*- mode: python ; coding: utf-8 -*-


a = Analysis(
    ['app/__init__.py'],
    pathex=['path\\to\\the\\project'],
    binaries=[],
    datas=[
        ('app/static', 'static'),
        ('app/templates', 'templates'),
        ('config.py', '.'),
        ('app/states.json', '.'),
    ],
    hiddenimports=[
        'flask_sqlalchemy',
        'flask_wtf',
        'jinja2.ext',
        'pysqlite2',
        'MySQLdb',
        'psycoopg2',
    ],
    hookspath=[],
     hooksconfig={},
     runtime_hooks=[],
     excludes=[],
     win_no_prefer_redirects=False,
     win_private_assemblies=False,
     noarchive=False,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='HoT_SkillTracker.exe',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon='app/static/favicon.ico',
)
