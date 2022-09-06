# Running CoSI locally

## Assumptions
- running iOS.
- (npm installed via homebrew)
- nvm installed
- git installed
- You have a Bitbucket account and access to the following repositories (if you do not have access, currently the developers at LGV can grant you access):
	- https://bitbucket.org/geowerkstatt-hamburg/masterportal
	- https://bitbucket.org/geowerkstatt-hamburg/addons
	- https://bitbucket.org/geowerkstatt-hamburg/portalconfigs
- You have your git authentication set up in your command line using an access token


## Qickstart
Run this in terminal:

```
git clone https://bitbucket.org/geowerkstatt-hamburg/masterportal
cd masterportal
git checkout cosi/dev

rm -r addons
rm -r portal

git clone https://bitbucket.org/geowerkstatt-hamburg/addons addons
git clone https://bitbucket.org/geowerkstatt-hamburg/portalconfigs portal

cd addons
git checkout cosi/dev
cd ../portal
git checkout cosi/dev
cd ..

nvm install 16.16.
nvm use 16.16.
node -v

npm install

cd addons
npm run postinstall
cd ..

npm start
```
After some compile time, CoSI should run at https://localhost:9001/portal/cosi

## Setup step by step Explanation

Cosi consists of three repositories. They are available on Bitbucket (private repos, owned by the city). There is also a fork on Github (privated repos, owned by the CityScienceLab github organisation). The three repos are: 
1. The `masterportal` (https://bitbucket.org/geowerkstatt-hamburg/masterportal)
2. Two folders of the masterportal are replaced by another repository each. These folders are set to be (git)ignored by the masterportal repository.
	1. the `addons` folder in masterportal is replaced by
		1. https://bitbucket.org/geowerkstatt-hamburg/addons
	2. the `portal` folder in masterportal is replaced by https://bitbucket.org/geowerkstatt-hamburg/portalconfigs
3. on all repositories we work on the branch called `cosi/dev` (not `dev`)

So we clone the masterportal repo first and get on the right branch

```
git clone https://bitbucket.org/geowerkstatt-hamburg/masterportal
cd masterportal
git checkout cosi/dev

```

Delete folders to be replaced with the other two repos

```
rm -r addons
rm -r portal
```


download relevant repos as these folders
- `geowerkstatt-hamburg/addons` as `addons`
- `geowerkstatt-hamburg/portalconfigs` as `portal`

```
git clone https://bitbucket.org/geowerkstatt-hamburg/addons addons
git clone https://bitbucket.org/geowerkstatt-hamburg/portalconfigs portal
```

Switch to the relevant branches

```
cd addons
git checkout cosi/dev
cd ../portal
git checkout cosi/dev
cd ..
```

Set up Node and Install. You might need to use a specific node version. On 24.08.22 it's `16.16.0` .

running in masterportal root folder
```
nvm install 16.16.
nvm use 16.16.
node -v
```

should return `16.16.0`

Then install the masterportal node dependencies (in masterportal root folder):
```
npm install 
```

Cosi consists of multiple nested node apps. For each, the dependencies have to be installed. there is a costum script to do this correctly (defined in /addons/package.json) that can be executed when in the addons folder:
```
cd addons
npm run postinstall
cd ..
```

Now you can give it a go and see if CoSI runs on your machine!
```
npm start
```

After some compile time, this should spit out:
```
ℹ ｢wds｣: Project is running at **https://localhost:9001/**

ℹ ｢wds｣: webpack output is served from **/build/**

```
..and some more stuff including `babel` notes.
once it finished compliation, navigate to https://localhost:9001/portal/cosi

# More Developer Documentation (under construction)


## Development Workflow

- This documentation assumes you're using VSCode as your IDE
	- Download VScode
	- install Plugins
		- eslint
		- vue
- To ensure the linter (checks coding rules are fulfilled) works, add the path to your masterportal root folder to the visual studio code `settings.json` file under `eslint.workingDirectories`

 
 ## TDD
- Understanding Tests
	- have a look at "vue test utils"
	- 
- Writing Tests
	- make tests short - test one thing at a time
	- test only internal components (i.e. not functioning of a third party api)
	- test only the smallest components, not end-to-end
	- tests for 
		- dom
		- computed properties
		- user interactions
	- as an example for how tests should look like, see districtselector
- Running tests
		- there is a command set up to run only the cosi tests: `test:cosi 

 

## Developer Rules & Pre-push Hooks

- Lint
- 
- 

## Resources
- code documentation generated in masterportal `npm run buildJsDoc`
- CoSI user documentation: https://github.com/citysciencelab/cosi/tree/master/cosi
- Masterportal Developer Documentation
- Class documentation in cosi/cosi/MODULE-NAME/doc

# Stack
- the open source project "masterportal" is the foundation. It runs on
	- Node
	- Vue
		- vuetifyjs


## Architecture
- Entry point:
	- `npm start` runs `masterportal/js/app.js`. everthing else flows from there.
