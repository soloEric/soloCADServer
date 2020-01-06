<<<<<<< HEAD
import os


def create_dir(path):
    if not os.path.exists(path):
        try:
            os.mkdir(path)
        except OSError:
            print("Creation of directory %s failed" % path)
        else:
            print("Successfully created directory %s" % path)




=======
import os


def create_dir(path):
    if not os.path.exists(path):
        try:
            os.mkdir(path)
        except OSError:
            print("Creation of directory %s failed" % path)
        else:
            print("Successfully created directory %s" % path)




>>>>>>> d3f4685089cc7861389430ca2e10aa1fb217952d
