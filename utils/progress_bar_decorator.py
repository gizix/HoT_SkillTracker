from tqdm import tqdm
import time

def progress_bar_decorator(function):
    def wrapper(*args, **kwargs):
        with tqdm(total=100, desc=function.__name__) as pbar:
            for i in range(10):
                time.sleep(0.1)  # Simulating work
                pbar.update(10)  # Update progress bar
            return function(*args, **kwargs)
    return wrapper
