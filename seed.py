"""

Seed file

"""
from __future__ import print_function
from db import upsert_user

def run():
    """
    Seed the database
    """
    upsert_user({
        'name': 'signatureuser',
        'email': 'signatureuser@email.com'
    })

if __name__ == '__main__':
    run()
