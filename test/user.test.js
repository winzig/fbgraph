var graph      = require('../lib/graph')
    , FBConfig = require('../lib/config').facebook
    , vows     = require('vows')
    , events   = require('events')
    , assert   = require('assert');


var testUser1   = {}
    , testUser2 = {};

// Create test suite
vows.describe('user').addBatch({
    'POST ': {
        topic: function () {
            var testUserUrl = '/' + FBConfig.appId + '/accounts/test-users?' + 
                'installed=true' + 
                '&name=Ricky Bobby' +
                '&permissions=' + FBConfig.scope +
                '&method=post' +
                '&access_token=' + FBConfig.appId + '|' + FBConfig.appSecret;

            graph.get(encodeURI(testUserUrl), this.callback);
        },

        'after creating `User1` ': {
            topic: function (res) {
                testUser1 = res;

                var testUserUrl = '/' + FBConfig.appId + '/accounts/test-users?' + 
                    'installed=true' + 
                    '&name=magic man' +
                    '&permissions=' + FBConfig.scope +
                    '&method=post' + 
                    '&access_token=' + FBConfig.appId + '|' + FBConfig.appSecret;

                graph.get(encodeURI(testUserUrl), this.callback);
            },

            'after creating `User2` ': {
                topic: function (res) {
                    testUser2 = res;

                    // The first call should be made with access token of user1
                    // This will creates a friend request from user1 to user2
                    var apiUrl =  testUser1.id + '/friends/' + testUser2.id + '?method=post';

                    graph.setAccessToken(testUser1.access_token);
                    graph.get(encodeURI(apiUrl), this.callback);
                },

                'when sending a friend request from `User1` to `User2` ': {

                    topic: function (res) {
                        var apiUrl =  testUser2.id + '/friends/' + testUser1.id + '?method=post';

                        // The second call should be made with access
                        // token for user2 and will confirm the request.
                        graph.setAccessToken(testUser2.access_token);
                        graph.get(encodeURI(apiUrl), this.callback);
                    },

                    '`User2` should accept friend request from `User1` ': function (res) {
                        assert.isTrue(res);
                    }
                }
            }
        },

        // following tests will only happen after 
        // an access token has been set
        'should have valid keys': function(err, res) {
            assert.include(res, 'id');
            assert.include(res, 'access_token');
            assert.include(res, 'login_url');
            assert.include(res, 'email');
            assert.include(res, 'password');
        }
    }
}).export(module);