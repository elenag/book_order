// -----------------------------------------------------------------
// SESSION
// -----------------------------------------------------------------

exports.ValidSession = function(session) {
	console.log(session);

    if (session.user == null) {
    	console.log('Invalid session (user). You need to Log in!!');
		return false;
    }

    return true;
};

// -----------------------------------------------------------------
// Generic
// -----------------------------------------------------------------
exports.IsDefined = function(resource) {
	return  (typeof(resource) != 'undefined');
}