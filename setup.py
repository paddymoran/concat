from setuptools import setup

setup(name='catalex_sign',
      version='0.0.1',
      description='Digitally sign PDFs',
      url='http://github.com/joshgagnon/document-signer',
      author='Joshua Gagnon',
      author_email='josh.n.gagnon@gmail.com',
      license='MIT',
      install_requires=[
          'flask',
          'requests',
          'psycopg2',
          'pdfrw',
          'reportlab',
          'python-dateutil',
          'raven[flask]'
      ],
        dependency_links=[
            "git+https://github.com/pmaupin/pdfrw.git#egg=pdfrw"
        ],
      zip_safe=False)
