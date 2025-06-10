from setuptools import setup, find_packages

setup(
    name="birth_time_rectifier",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        'geopy==2.4.1',
        'pytz==2024.1',
        'pytest==8.3.4',
        'numpy==1.26.4',
    ],
    python_requires='>=3.8',
) 