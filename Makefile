install:
	npm ci

develop:
	npx webpack serve

build:
	rm -rf dist
	npx cross-env NODE_ENV=production npx webpack

test:
	npx jest

lint:
	npx eslint .
