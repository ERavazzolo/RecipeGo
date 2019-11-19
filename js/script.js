// RECIPE DATABASE
var dataController = (function() {

    // Recipe constructor
    var Recipe = function(name, page) {
        this.name = name;
        this.page = page;
    };

    // Array where all recipes are stored --> Check if there is a localStorage
    var allRecipes = localStorage.getItem('storage') ? JSON.parse(localStorage.getItem('storage')) : [];

    // dataController's public methods --> sends info to controller
    return {
        addItem: function(n, p) {   // n = name, p = page (to avoid confusion)
            var newItem;

            // Create new item
            newItem = new Recipe(n, p);

            // Push item into data structure
            allRecipes.push(newItem);

            // Save item to localStorage
            localStorage.setItem('storage', JSON.stringify(allRecipes));

            // Return item
            return newItem;
        },

        getAllRecipes: function() {     //return updated allRecipes 
            // Retrieve localStorage data
            JSON.parse(localStorage.getItem('storage'));
            return allRecipes;
        }
    };

})();



// UI CONTROLLER
var UIController = (function() {

    var DOMstrings = {      // html info here
        inputAddName: '.add__recipe',
        inputPage: '.add__page',
        inputAddBtn: '.add__btn',
        inputAdd: '.add',
        inputSearchName: '.search__recipe',
        inputSearchBtn: '.search__btn',
        itemResult: '.search__result',
        itemDisplay: '.search__name',
        saved: '.add__confirm'
    };

    return {

        // Get DOMstrings to pass them into controller
        getDOMstrings: function() { 
            return DOMstrings;
        },

        // SAVE NEW ITEM UI
        // Get input fields data, pass them to controller to create new recipe
        getAddInput: function() {
            if(document.querySelector(DOMstrings.inputAddName).value != "" && document.querySelector(DOMstrings.inputPage).value != "") {
                return {
                    name: document.querySelector(DOMstrings.inputAddName).value,
                    page: document.querySelector(DOMstrings.inputPage).value
                }
            }
        },

        animateSaveButton: function() {
            var saveBtn, addInput;

            saveBtn = document.querySelector(DOMstrings.inputAddBtn);

            if(document.querySelector(DOMstrings.inputAddName).value != "" && document.querySelector(DOMstrings.inputPage).value != "") {
                // Show element when save btn is pressed
                saveBtn.classList.add("saveIsPressed");
            }

            // Get html input element and store it in variable
            addInput = document.querySelector(DOMstrings.inputAddName);

            // Remove enimation when user is typing another item
            addInput.onchange = function() {
                saveBtn.classList.remove("saveIsPressed");
            }
        },

        confirmSaved: function() {
            var saved, nameInput;

            // Get html element for 'saved' and store it in variable
            saved = document.querySelector(DOMstrings.saved);

            if(document.querySelector(DOMstrings.inputAddName).value != "" && document.querySelector(DOMstrings.inputPage).value != "") {
                // Show element when save btn is pressed
            saved.classList.add("isVisible");
            }

            // Get html add name and search name inputs and store them in variables
            nameInput = document.querySelector(DOMstrings.inputAddName);

            searchInput = document.querySelector(DOMstrings.inputSearchName);

            // Return focus on first input after previous item is entered (btn was pressed)
            nameInput.focus();

            // Remove element (confirmation of saved item) when user adds a new item or search an item
            nameInput.oninput = function() {
                saved.classList.remove("isVisible");
            }

            searchInput.oninput = function() {
                saved.classList.remove("isVisible");
            }
        },

        // SEARCH ITEM UI
        // Get search input field data, pass it to controller to search for recipe
        getSearchInput: function() {
            return {
                name: document.querySelector(DOMstrings.inputSearchName).value
            }
        },

        // Animate search button (this is called in event listener)
        animateSearchButton: function() {
            var btn, searchInput;

            btn = document.querySelector(DOMstrings.inputSearchBtn);

            if(document.querySelector(DOMstrings.inputSearchName).value != "") {
                // Show element when save btn is pressed
                btn.classList.add("searchIsPressed");
            }

            // Get html input element and store it in variable
            searchInput = document.querySelector(DOMstrings.inputSearchName);

            // Return focus on search input after previous search (btn was pressed)
            searchInput.focus();

            // Remove animation when user is typing another search
            searchInput.oninput = function() {
                btn.classList.remove("searchIsPressed");
            }
        },

        // Look up item in recipe list
        searchItemList: function(input, arr) {
            var input, arr, value, element, html, newHtml, result;

            for (var i = 0; i < arr.length; i++) {
                value = arr[i].name.toUpperCase();      // Transform array item into Uppercase to avoid case sensibility
                
                if(value === input && value != "") {
                    element = DOMstrings.itemResult;    // Get place where to push Html and store it into variable

                    result = arr[i];    // This is the array item that matches the search, stored into variable

                    // Create html string with placeholder text
                    html = '<p class="search__name"><span class="search__name-only">%name%, </span><span class="search__page">page %page%</span></p>';
                }
            }
    
            // Replace placeholder text with actual data
            newHtml = html.replace('%name%', result.name).replace('%page%', result.page);

            // Push Html into DOM (where element is placed)
            document.querySelector(element).insertAdjacentHTML('afterbegin', newHtml);
        },

        // SHARED TASKS
        // Clear input field after search
        clearFields: function() {
            var fields, arrFields;

            // Get all input fields and store them into variable. This method returns a list (not an array!)
            fields = document.querySelectorAll(DOMstrings.inputAddName + ', ' + DOMstrings.inputPage + ', ' + DOMstrings.inputSearchName);

            // Use slice + call methods into Array.prototype, pass fields variable as argument. This transform the list into an array. Store into variable
            arrFields = Array.prototype.slice.call(fields);

            arrFields.forEach(function(current, index, array) {     // Set value of each field to an empty string
                current.value = "";
            });
        },

        // Clear result displayed from previous search
        clearResult: function() { 
            var oldSearch;

            oldSearch = document.querySelector(DOMstrings.itemResult);
            while(oldSearch.lastChild) {
                oldSearch.removeChild(oldSearch.lastChild);
            }
        }
    };

})();




// GLOBAL CONTROLLER
var controller = (function(dataCtrl, UICtrl) {

    function isSupported(storage) {
        try {
            const key = "__some_random_key_you_are_not_going_to_use__";
            storage.setItem(key, key);
            storage.removeItem(key);
            return true;
        } catch (e) {
            return false;
        }
    }

    // Events listeners
    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();

        // Event listeners for adding new item
        document.querySelector(DOM.inputAddBtn).addEventListener('click', ctrlAddItem);

        document.querySelector(DOM.inputAdd).addEventListener('keypress', function(event) {
            if (event.keycode === 13 || event.which === 13) {
                UICtrl.animateSaveButton();
                ctrlAddItem();
            }
        });

        //Event listeners for searching new item
        document.querySelector(DOM.inputSearchBtn).addEventListener('click', ctrlSearchItem);

        document.querySelector(DOM.inputSearchName).addEventListener('keypress', function(event) {
            if (event.keycode === 13 || event.which === 13) {
                UICtrl.animateSearchButton();
                ctrlSearchItem();
            }
        });
    }

    // ADD NEW RECIPE
    var ctrlAddItem = function() {      //this happens when save btn gets pressed
        var addInput, newItem;

        // 1. Get the input field data from UIController
        addInput = UICtrl.getAddInput();

        // 2. Add the item to allRecipes array in dataController
        newItem = dataCtrl.addItem(addInput.name, addInput.page);

        // 3. Confirm item was saved
        UICtrl.confirmSaved();

        // 4. Clear fields after saving
        UICtrl.clearFields();
    };

    // SEARCH RECIPE

    var ctrlSearchItem = function() {       //this happens when search btn gets pressed

        var searchInput, arrRecipes, string, word;

        // 1. Clear result displayed after previous search
        UICtrl.clearResult();

        // 1. Get input field data from UIController and store it in variable
        searchInput = UICtrl.getSearchInput();
        string = searchInput.name.toUpperCase();    // Transform input field data to Uppercase to avoid case sensibility
        word = string.trim();       // Remove extra spaces at the beginning and end of string to avoid errors ('item ' != 'item' --> item not found)

        // 2. Get allRecipes array from dataController and store it in variable
        arrRecipes = dataCtrl.getAllRecipes();
        
        // 3. Display result to UI
        UICtrl.searchItemList(word, arrRecipes);

        // 4. Clear fields after search
        UICtrl.clearFields();
    };

    var clearLocalStorage = function() {    // clear localStorage for testing purposes
        localStorage.clear();
    }

    return {
        init: function() {
            setupEventListeners();
            isSupported();
            //clearLocalStorage();
        }
    }

})(dataController, UIController);

controller.init();