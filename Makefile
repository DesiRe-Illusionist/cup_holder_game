run:
	rm -f raw.csv data.json
	cp backup.json data.json
	python listener.py

clean:
	rm -f raw.csv data.json