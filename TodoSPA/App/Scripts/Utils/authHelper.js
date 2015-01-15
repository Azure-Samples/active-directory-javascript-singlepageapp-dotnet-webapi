define(function () {

    var config = {
        tenant: 'strockisdev.onmicrosoft.com',
        clientId: 'b075ddef-0efa-453b-997b-de1337c29185',
        postLogoutRedirectUri: window.location.origin,
        //cacheLocation: 'localStorage', IE Bug?
    };

    return new AuthenticationContext(config);

});