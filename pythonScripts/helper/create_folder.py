
import os


def create_dir(path):
    if not os.path.exists(path):
        try:
            os.mkdir(path)
        except OSError:
            print("Creation of directory %s failed" % path)
        else:
            print("Successfully created directory %s" % path)

