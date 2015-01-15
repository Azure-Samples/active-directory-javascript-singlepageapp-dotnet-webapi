    
(function () {

    // Enter Global Config Values & Instantiate ADAL AuthenticationContext
    window.config = {
        tenant: 'strockisdev.onmicrosoft.com',
        clientId: 'b075ddef-0efa-453b-997b-de1337c29185',
        postLogoutRedirectUri: window.location.origin,
        cacheLocation: 'localStorage', // IE Bug?
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
        loadCtrl(stripHash($(event.target).attr('href')));
    });

    // Route View Requests
    function viewCtrlMap(view) {
        var script;
        switch (view) {
            case 'Home':
                script = 'homeCtrl';
                break;
            case 'TodoList':
                script = 'todoListCtrl';
                break;
            case 'UserData':
                script = 'homeCtrl'; // For Now, So IE doesn't throw
                break; 
        }

        $.ajax({
            type: "GET",
            url: "App/Scripts/Ctrls/" + script + ".js",
            dataType: "script",
            cache: true,
        }).done(function () {
            console.log('View Script Loaded');
            var ctrl;
            switch (view) {
                case 'Home':
                    ctrl = homeCtrl;
                    break;
                case 'TodoList':
                    ctrl = todoListCtrl;
                    break;
                case 'UserData':
                    ctrl = homeCtrl; // For Now, So IE doesn't throw
                    break;
            }
            loadView(ctrl, view);
        }).fail(function () {
            console.log('Error getting controller script');
            $errorMessage.html('Error Loading View JS.');
        });
    }

    // Load Controller JS File
    function loadCtrl(view) {
        $errorMessage.empty();
        viewCtrlMap(view);
    }

    // Show a View
    function loadView(ctrl, view) {

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

        


