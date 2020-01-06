import sys

numArgs = len(sys.argv)

if numArgs > 1:
    for i in range(1, numArgs):
        print(sys.argv[i])

sys.stdout.flush()