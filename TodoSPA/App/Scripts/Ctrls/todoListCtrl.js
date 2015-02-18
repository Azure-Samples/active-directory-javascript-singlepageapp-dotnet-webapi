(function () {

    // The HTML for this View
    var viewHTML;
    // Instantiate the ADAL AuthenticationContext
    var authContext = new AuthenticationContext(config);

    function refreshViewData() {

        // Empty Old View Contents
        var $dataContainer = $(".data-container");
        $dataContainer.empty();
        var $loading = $(".view-loading");

        // Acquire Token for Backend
        authContext.acquireToken(authContext.config.clientId, function (error, token) {

            // Handle ADAL Error
            if (error || !token) {
                printErrorMessage('ADAL Error Occurred: ' + error);
                return;
            }

            // Get TodoList Data
            $.ajax({
                type: "GET",
                url: "/api/TodoList",
                headers: {
                    'Authorization': 'Bearer ' + token,
                },
            }).done(function (data) {

                var $html = $(viewHTML);
                var $template = $html.find(".data-container");

                // For Each Todo Item Returned, Append a Table Row
                var output = data.reduce(function (rows, todoItem, index, todos) {
                    var $entry = $template;
                    var $description = $entry.find(".view-data-description").html(todoItem.Description);
                    $entry.find(".data-template").attr('data-todo-id', todoItem.ID);
                    return rows + $entry.html();
                }, '');

                // Update the UI
                $loading.hide();
                $dataContainer.html(output);

            }).fail(function () {
                printErrorMessage('Error getting todo list data')
            }).always(function () {

                // Register Handlers for Buttons in Data Table
                registerDataClickHandlers();
            });
        });
    };

    function registerDataClickHandlers() {

        // Delete Button(s)
        $(".view-data-delete").click(function (event) {
            clearErrorMessage();

            var todoId = $(event.target).parents(".data-template").attr("data-todo-id");

            // Acquire Token for Backend
            authContext.acquireToken(authContext.config.clientId, function (error, token) {

                // Handle ADAL Errors
                if (error || !token) {
                    printErrorMessage('ADAL Error Occurred: ' + error);
                    return;
                }

                // Delete the Todo
                $.ajax({
                    type: "DELETE",
                    url: "/api/TodoList/" + todoId,
                    headers: {
                        'Authorization': 'Bearer ' + token,
                    },
                }).done(function () {
                    console.log('DELETE success.');
                }).fail(function () {
                    console.log('Fail on new Todo DELETE');
                    printErrorMessage('Error deleting todo item.')
                }).always(function () {
                    refreshViewData();
                });
            });
        });

        // Edit Button(s)
        $(".view-data-edit").click(function (event) {
            clearErrorMessage();
            var $entry = $(event.target).parents(".data-template");
            var $entryDescription = $entry.find(".view-data-description").hide();
            var $editInput = $entry.find(".view-data-edit-input");
            $editInput.val($entryDescription.text());
            $editInput.show();
            $entry.find(".view-data-mode-delete").hide();
            $entry.find(".view-data-mode-edit").show();
        });

        // Cancel Button(s)
        $(".view-data-cancel-edit").click(function (event) {
            clearErrorMessage();
            $entry = $(event.target).parents(".data-template");
            $entry.find(".view-data-description").show();
            $editInput = $entry.find(".view-data-edit-input").hide();
            $editInput.val('');
            $entry.find(".view-data-mode-delete").show();
            $entry.find(".view-data-mode-edit").hide();
        });

        // Save Button(s)
        $(".view-data-save").click(function (event) {
            clearErrorMessage();
            var $entry = $(event.target).parents(".data-template");
            var todoId = $entry.attr("data-todo-id");

            // Validate Todo Description
            var $description = $entry.find(".view-data-edit-input");
            if ($description.val().length <= 0) {
                printErrorMessage('Please enter a valid Todo description');
                return;
            }

            // Acquire Token for Backend
            authContext.acquireToken(authContext.config.clientId, function (error, token) {

                // Handle ADAL Errors
                if (error || !token) {
                    printErrorMessage('ADAL Error Occurred: ' + error);
                    return;
                }

                // Update Todo Item
                $.ajax({
                    type: "PUT",
                    url: "/api/TodoList",
                    headers: {
                        'Authorization': 'Bearer ' + token,
                    },
                    data: {
                        Description: $description.val(),
                        ID: todoId,
                    },
                }).done(function () {
                    console.log('PUT success.');
                }).fail(function () {
                    console.log('Fail on todo PUT');
                    printErrorMessage('Error saving todo item.')
                }).always(function () {
                    refreshViewData();
                    $description.val('');
                });
            });
        });
    };

    function registerViewClickHandlers() {

        // Add Button
        $(".view-addTodo").click(function () {
            clearErrorMessage();

            // Validate Todo Description
            var $description = $("#view-todoDescription");
            if ($description.val().length <= 0) {
                printErrorMessage('Please enter a valid Todo description');
                return;
            }

            // Acquire Token for Backend
            authContext.acquireToken(authContext.config.clientId, function (error, token) {

                // Handle ADAL Errors
                if (error || !token) {
                    printErrorMessage('ADAL Error Occurred: ' + error);
                    return;
                }

                // POST a New Todo
                $.ajax({
                    type: "POST",
                    url: "/api/TodoList",
                    headers: {
                        'Authorization': 'Bearer ' + token,
                    },
                    data: {
                        Description: $description.val(),
                    },
                }).done(function () {
                    console.log('POST success.');
                }).fail(function () {
                    console.log('Fail on new Todo POST');
                    printErrorMessage('Error adding new todo item.');
                }).always(function () {

                    // Refresh TodoList
                    $description.val('');
                    refreshViewData();
                });
            });
        });
    };

    function clearErrorMessage() {
        var $errorMessage = $(".app-error");
        $errorMessage.empty();
    };

    function printErrorMessage(mes) {
        var $errorMessage = $(".app-error");
        $errorMessage.html(mes);
    }

    // Module
    window.todoListCtrl = {
        requireADLogin: true,
        preProcess: function (html) {

        },
        postProcess: function (html) {
            viewHTML = html;
            registerViewClickHandlers();
            refreshViewData();
        },
    };
}());

    