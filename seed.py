from __future__ import print_function
import db

def run():
    upsert_user({
                'name': 'signatureuser',
                'email': 'signatureuser@email.com'
                })

if __name__ == '__main__':
    run()
