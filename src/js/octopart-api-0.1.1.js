/** Octopart API - JavaScript Library
 *  andres@octopart.com
 *
 *  !!! THIS LIBRARY DEPENDS ON JQUERY IN 3 PLACES !!!
 *
 *  // example part search:
 *  var client = new octopart.SearchClient();
 *  client.setQueryString('tantalum capacitor');
 *  client.submit({start:0,limit:20},function(response){
 *      for (i in response.results) {
 *          part = response.results[i].item;
 *          alert(part.manufacturer.displayname+' - '+part.mpn);
 *      }
 *  });
 *
 *
 *  // example search query suggestion
 *  octopart.Part.suggest({q:'sn74f',limit:5},function(response){
 *      for (i in response.results) {
 *          suggestion = response.results[i];
 *          alert(suggestion);
 *      }
 *  });
 *
 */

(function ()
{
    // add library to window
    if (window.octopart) return;
    else window.octopart = {};


    var api_url = 'http://octopart.com/api/v2/';
    var api_key = null;


    // -------------- define search client ---------------------
    function SearchClient(args)
    {
        args = args || {};
        this.reset();

        // set request args
        for (key in args)
        {
            this.request[key] = args[key];
        }
    };


    SearchClient.prototype.reset = function ()
    {
        this.request = {};
    };


    SearchClient.prototype.addFilter = function (fieldname, value)
    {
        if (!this.request.filters) this.request.filters = [];
        this.request.filters.push([fieldname, [value]]);
    };


    SearchClient.prototype.addRangedFilter = function (fieldname, min, max)
    {
        if (!this.request.rangedfilters) this.request.rangedfilters = [];
        this.request.rangedfilters.push([fieldname, [
            [min, max]
        ]]);
    };


    SearchClient.prototype.deleteFilter = function (fieldname, value)
    {
        // This function deletes all filters on *fieldname*
        // TODO: remove only filters on *(fieldname,value)*
        this.request.filters = $.grep(this.request.filters, function (filter, i)
        {
            return (filter[0] != fieldname && filter[1][0] != value);
        });

        this.request.rangedfilters = $.grep(this.request.rangedfilters, function (filter, i)
        {
            return (filter[0] != fieldname);
        });
    };


    SearchClient.prototype.setQueryString = function (querystring)
    {
        this.request.q = querystring;
    };


    SearchClient.prototype.setSortBy = function (sortby)
    {
        this.request.sortby = sortby;
    };


    SearchClient.prototype.submit = function (args, callback)
    {
        args = args || {};

        var self = this;

        // build url arguments
        var urlargs = {};

        urlargs.q = self.request.q;
        urlargs.filters = JSON.stringify(self.request.filters || []);
        urlargs.rangedfilters = JSON.stringify(self.request.rangedfilters || []);
        urlargs.sortby = JSON.stringify(self.request.sortby || [
            ['score', 'desc']
        ]);

        if ('start' in args) urlargs.start = args.start;
        if ('limit' in args) urlargs.limit = args.limit;
        if ('drilldown.include' in args) urlargs['drilldown.include'] = args['drilldown.include'];
        if ('drilldown.fieldname' in args) urlargs['drilldown.fieldname'] = args['drilldown.fieldname'];
        if ('drilldown.facets.start' in args) urlargs['drilldown.facets.start'] = args['drilldown.facets.start'];
        if ('drilldown.facets.limit' in args) urlargs['drilldown.facets.limit'] = args['drilldown.facets.limit'];
        if ('drilldown.facets.sortby' in args) urlargs['drilldown.facets.sortby'] = args['drilldown.facets.sortby'];
        if ('drilldown.facets.prefix' in args) urlargs['drilldown.facets.prefix'] = args['drilldown.facets.prefix'];

        if (api_key) urlargs['apikey'] = api_key;

        // send request
        $.getJSON(
                api_url + 'parts/search?callback=?',
                urlargs,
                function (response)
                {
                    // update client
                    self.request = response.request;

                    // instantiate part objects
                    for (i in response.results)
                    {
                        response.results[i].item = new Part(response.results[i].item);
                    }

                    // execute callback
                    if (callback) callback(response);
                }
        );
    };


    // ---------- define Part class ------------------
    function Part(args)
    {
        args = args || {};
        for (key in args)
        {
            this[key] = args[key];
        }
    };


    Part.suggest = function (args, callback)
    {
        // Part search query suggestor
        var urlargs = args || {};

        if ('q' in args) urlargs.q = args.q;
        if ('limit' in args) urlargs.limit = args.limit;

        $.getJSON(
                api_url + 'parts/suggest?callback=?',
                urlargs,
                function (response)
                {
                    // execute callback
                    if (callback) callback(response);
                }
        );
    };


    Part.prototype.getAttributeValues = function (fieldname)
    {
        for (i in this.specs)
        {
            if (this.specs[i].attribute.fieldname == fieldname) return this.specs[i].values;
        }
        return null;
    };


    // ----------- attach classes and methods to octopart library ---------------
    octopart.SearchClient = SearchClient;
    octopart.Part = Part;
    octopart.set_apiurl = function (url)
    {
        api_url = url;
    };
    octopart.set_apikey = function (key)
    {
        api_key = key;
    };
})();
