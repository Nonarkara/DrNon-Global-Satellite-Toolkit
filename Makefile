# DrNon Global Satellite Toolkit
#
#   make          → install and run. That is the whole quick start.
#   make probe    → verify every data source against the live internet.
#
.DEFAULT_GOAL := start
.PHONY: start install dev build verify probe probe-all python notebook \
        docker docker-tiler clean help

## Install dependencies and start the dev server
start: install dev

## Install Node dependencies
install:
	npm install

## Run the dev server on http://localhost:3000
dev:
	npm run dev

## Production build
build:
	npm run build

## Typecheck + lint + build — what CI runs
verify:
	npm run verify

## Probe every keyless data source against the live internet
probe:
	npm run probe

## Probe all sources, including those needing credentials
probe-all:
	npm run probe:all

## Set up the Python STAC environment in ./ingestion/.venv
python:
	python3 -m venv ingestion/.venv
	./ingestion/.venv/bin/pip install --upgrade pip
	./ingestion/.venv/bin/pip install -r ingestion/requirements.txt
	@echo ""
	@echo "  Ready. Try:"
	@echo "    ./ingestion/.venv/bin/python ingestion/stac_search.py --aoi bangkok"
	@echo ""

## Python environment plus JupyterLab and leafmap
notebook: python
	./ingestion/.venv/bin/pip install -r ingestion/requirements-notebook.txt
	./ingestion/.venv/bin/jupyter lab ingestion/

## Build and run the app in Docker
docker:
	docker build -t drnon-satellite-toolkit .
	docker run --rm -p 3000:3000 --env-file .env drnon-satellite-toolkit

## Run a local TiTiler so you are not depending on the public demo
docker-tiler:
	docker run --rm -p 8000:8000 ghcr.io/developmentseed/titiler:latest
	@echo "Set NEXT_PUBLIC_TITILER_URL=http://localhost:8000 in .env"

clean:
	rm -rf .next node_modules ingestion/.venv

help:
	@awk 'BEGIN{FS=":.*"} /^## /{d=substr($$0,4)} \
	     /^[a-z][a-z-]*:/{if(d){printf "  \033[36m%-14s\033[0m %s\n",$$1,d; d=""}}' $(MAKEFILE_LIST)
