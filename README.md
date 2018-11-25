# Directory
Directories|Comments
-|-
[common_libs](/common_libs)    |Some common database operation functions are placed here
[page_handles](/page_handles)|Put the route handles here
[views](/views)                |Put templates here. This is also the default *view* directory of *express*
[css](/css)|Put css files here. Common css file will be [style.css](/css/style.css)

# Module
Module Name|Comments
-|-
mongodb|version 2.2.31. Caution, version greater than that was specified in package.json may cause errors 

# Write page handels
1. Put the page handle file into [pages_handles](/page_handles) directory
2. Use keyword *module.exports* to export all functions of the file.
3. Use keyword *require* to import those functions as a page handle in [index.js](/index.js)
> See [page_handles/sample_homepage.js](/page_handles/sample_homepage.js) for details

# Rules of naming
Use lower case for naming files. There should be an underscore between each meaningful word

# ES6
A test before showed that the IBM cloud supports ES6, hence the codes in [common_libs](/common_libs) have been rewritten with new style.  
Using *ES6 standard* has lots of benefits, such as increased writability and enhenced erro handling. The callback function in nodejs brings great performance in responsive speed, however it also brings troubles in error handling. Programmer cannot deal with error occurs in callback function using try...catch... block as usual. Once it throws an error within a callback, the whole program will **crash**! Eventough in ES6 this problem still exist. **Be careful**!  
To solve this problem, ES6 brings us a new feature called *promise*. With the promise mechanism, errors inside a callback can be properly handled in a delicated way. Always remenber, **never** throw an error within a callback.  

# Setup
```
# install
npm install
# start
npm start
```

# Git
1. **DO NOT** push any files under [node_modules](/node_modules) to the remote branch. Use [.gitignore](/.gitignore) to ignore those files before push
2. **Before** you create a new branch, write down what you will do into [TASK_LIST.md](TASK_LIST.md) and push the changed list to the main branch in remote repository so that others can know what tasks were selected. 
3. **Before** merging your branch into master branch, switch to master branch and make a pull request first. 
4. Make your commit messages as **clean** as possible. Every time you commit a document work, just write "document changes" or something similary you like into the commit message. You had better not to mix coding and document work in one commit.