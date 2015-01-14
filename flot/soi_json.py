import re

with open('soi.txt', 'r') as f:
    contents = f.read().strip()
    nums = re.split('\s+', contents)
    print '[' + ', '.join(nums) + ']'
