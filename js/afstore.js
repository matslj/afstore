/**
 * 
 * By Mats Ljungquist
 * 
 */

var afstore = afstore || {};

afstore.URL = "testdata.json"; // "https://www.somecompany.se/redimo/rest/vacantproducts?lang=sv_SE&type=2";
afstore.REFERER = "";

(function($) {
    var template = $("#tmpl-list-item").html(),
        $stores = $("#stores"),
        $console = $("#console"),
        $selectedFilter = $("#selectedFilter");
        
    Mustache.parse(template);
    registerUIHandlers();
    
    // Initiate the ui
    $(document).bind("mobileinit", function() {
        $(document).on("pageshow", "#list", function() {
            var filter = "";
            if (typeof window.localStorage !== "undefined") {
                filter = getFilter();
                $selectedFilter.html(filter ? "filter: " + filter : "- alla områden -");
            } else {
                $("#filterEdit").css("display: none;");
            }
            loadSchemaAjax();
        });
    });
    
    /**
     * Register all ui handlers. There's only two:
     * <ol>
     * <li>Refresh button
     * <li>Set filter button
     * <ol>
     */
    function registerUIHandlers() {
        // Filter button
        $("#filterChangeBtn").click(function() {
            var filter = $("#filterInput").val();
            if (typeof(window.localStorage) !== "undefined") {
                window.localStorage.setItem("filter", filter.toLowerCase());
            }
            $("#filterDialog").dialog("close");
        });
        
        // Refresh button
        $("#refresh").click(function() {
            loadSchemaAjax();
        });
    }
    
    /**
     * Get registered filter from local storage (if localstorage and
     * filter exists) and return it. 
     * 
     * @returns {DOMString|String} The registerd filter or "" if none exists
     */
    function getFilter() {
        if (typeof window.localStorage.getItem("filter") !== "undefined" &&
            window.localStorage.getItem("filter")) {
            return window.localStorage.getItem("filter");
        }
        return "";
    }
    
    /**
     * Used by array.sort in order to sort entries by area name A - Z.
     * 
     * @param {type} a area a
     * @param {type} b area b
     * @returns {Number} if a < b return -1, if a > b return 1 else 0
     */
    function sortByArea(a, b){
        var aArea = a.area.toLowerCase();
        var bArea = b.area.toLowerCase(); 
        return ((aArea < bArea) ? -1 : ((aArea > bArea) ? 1 : 0));
    }
    
    /**
     * Write/show status/error-msg on screen.
     * 
     * @param {type} message message to be written
     */
    function writeMsg(message) {
        $console.html(message);
        if (message) {
            $console.addClass("msg");
        } else {
            $console.removeClass("msg");
        }
    }

    /**
     * Retrieves the storageunits in json-format using ajax.
     * The retrieved data is presented on screen.
     * Sorts and filters data.
     */
    function loadSchemaAjax() {
        writeMsg("Hämtar data...");
        $.ajax(afstore.URL, {
            complete: function(xhr) {
                var data = xhr.responseJSON,
                    tempArray = [],
                    area = null,
                    i = data.product.length,
                    filter = getFilter();
                
                for (;i--;) {
                    // Modifications to data
                    data.product[i].reserved = data.product[i].reserved === "true";
                    // Filtering
                    if (filter) {
                        area = data.product[i].area.toLowerCase();
                        if (area.indexOf(filter) >= 0) {
                            tempArray.push(data.product[i]);
                        }    
                    }
                }
                    
                data.product = filter ? tempArray : data.product;
                
                data.product.sort(sortByArea);
                $stores.html(Mustache.render(template, data));
                $stores.listview('refresh');
                writeMsg("");
            },
            dataType: 'json',
            error: function() {
                writeMsg("fel uppstod vid hämtning");	
            }
        });
    }
})(jQuery);