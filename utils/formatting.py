def format_file_size(size: int) -> str:
    """Format size to be displayed in KB, MB, or GB."""
    if size < 1024 * 1024:  # less than 1MB
        return f"{size / 1024:.2f} KB"
    elif size < 1024 * 1024 * 1024:  # less than 1GB
        return f"{size / (1024 * 1024):.2f} MB"
    else:
        return f"{size / (1024 * 1024 * 1024):.2f} GB"
