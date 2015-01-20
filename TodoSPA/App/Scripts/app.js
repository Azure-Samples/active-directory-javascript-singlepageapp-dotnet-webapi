    
(function () {

    // Enter Global Config Values & Instantiate ADAL AuthenticationContext
    window.config = {
        tenant: 'strockisdev.onmicrosoft.com',
        clientId: 'b075ddef-0efa-453b-997b-de1337c29185',
        postLogoutRedirectUri: window.location.origin,
        //cacheLocation: 'localStorage', // enable for IE, as sessionStorage does not work for localhost.
    };
    var authContext = new AuthenticationContext(config);

    // Get UI jQuery Objects
    var $panel = $(".panel-body");
    var $userDisplay = $(".app-user");
    var $signInButton = $(".app-login");
    var $signOutButton = $(".app-logout");
    var $errorMessage = $(".app-error");

    // Check For & Handle Redirect From AAD After Login
    authContext.handleWindowCallback();
    $errorMessage.html(authContext.getLoginError());

    // Check Login Status, Update UI
    var user = authContext.getCachedUser();
    if (user) {
        $userDisplay.html(user.userName);
        $userDisplay.show();
        $signInButton.hide();
        $signOutButton.show();
    } else {
        $userDisplay.empty();
        $userDisplay.hide();
        $signInButton.show();
        $signOutButton.hide();
    }

    // Register NavBar Click Handlers
    $signOutButton.click(function () {
        authContext.logOut();
    });
    $signInButton.click(function () {
        authContext.login();
    });
    $(".app-viewLink").click(function (event) {
        loadView(stripHash($(event.target).attr('href')));
    });

    // Route View Requests To Appropriate Controller
    function loadCtrl(view) {
        switch (view) {
            case 'Home':
                return homeCtrl;
            case 'TodoList':
                return todoListCtrl;
            case 'UserData':
                return homeCtrl; // For Now, So IE doesn't throw
        }
    }

    // Show a View
    function loadView(view) {

        $errorMessage.empty();
        var ctrl = loadCtrl(view);

        // Check if View Requires Authentication
        if (ctrl.requireADLogin && !authContext.getCachedUser()) {
            authContext.login();
            return;
        }

        // Load View HTML
        $.ajax({
            type: "GET",
            url: "App/Views/" + view + '.html',
            dataType: "html",
        }).done(function (html) {

            // Show HTML Skeleton (Without Data)
            var $html = $(html);
            $html.find(".data-container").empty();
            $panel.html($html.html());
            ctrl.postProcess(html);

        }).fail(function () {
            $errorMessage.html('Error loading page.');
        }).always(function () {

        });
    };

    function stripHash(view) {
        return view.substr(view.indexOf('#') + 1);
    }

}());

        


