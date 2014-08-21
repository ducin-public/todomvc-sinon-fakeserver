define(['sinon'],
function(sinon) {

    var inMemoryData = [
        {
            title: 'learn sinon.js',
            completed: true
        }, {
            title: 'plant a tree',
            completed: false
        }, {
            title: 'build a house',
            completed: false
        }
    ];

    var fakeServerWrapper = {

        urlRoot: 'http://api.todomvc.com',

        init: function() {
            this.fs = sinon.fakeServer.create();

            this.fs.xhr.useFilters = true;
            this.fs.xhr.addFilter(function(method, url, async, username, password) {
                return !(new RegExp(this.urlRoot)).test(url);
            });

            // configure model list resource
            this.fs.respondWith("GET", this.urlRoot + '/todo',
                [200, { "Content-Type": "application/json" },
                    JSON.stringify(inMemoryData) ]);

            // configure single model item resource
            this.fs.respondWith("POST", this.urlRoot + '/todo',
                function (xhr) {
                    var todo,
                        obj = JSON.parse(xhr.requestBody);
                    if (obj.order === null) { // new object
                        delete obj.order;
                        inMemoryData.push(obj);
                    } else if (obj.oldTitle) { // "title" attribute changed
                        todo = _.find(inMemoryData, function(item){ return item.title == obj.oldTitle; });
                        todo.title = obj.title;
                    } else { // "completed" attribute changed
                        todo = _.find(inMemoryData, function(item){ return item.title == obj.title; });
                        todo.completed = obj.completed;
                    }
                    console.log(inMemoryData);
                    xhr.respond(200, { "Content-Type": "application/json" });
            });

            this.fs.autoRespond = true;
            sinon.log('fake server initialized');
        }
    }

    return fakeServerWrapper;
});
