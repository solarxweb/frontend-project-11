install:
	npm ci

develop:
	npx webpack serve

build:
	npx cross-env NODE_ENV=production npx webpack
	
test:
	npx playwright test

lint:
	npx eslint .
