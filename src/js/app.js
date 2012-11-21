var api_url = 'http://octopart.com/api/v2/';
var api_key = 'ac357482';

var currentCategory = 4161;
var previousCategory = 4161;

bb.init({bb10HighlightColor: "#B2CC00",
    bb10ActionBarDark: true,
    bb10ControlsDark: true,
    bb10ListsDark: false,
    // Fires "before" styling is applied and "before" the screen is inserted in the DOM
    onscreenready: function (element, id)
    {
        // Remove all titles "except" input and pill buttons screen if running on BB10
        if (bb.device.isBB10 && id != 'input' && id != 'pillButtons')
        {
            var titles = element.querySelectorAll('[data-bb-type=title]');
            if (titles.length > 0)
            {
                titles[0].parentNode.removeChild(titles[0]);
            }
        }
    },
    // Fires "after" styling is applied and "after" the screen is inserted in the DOM
    ondomready: function (element, id)
    {
        if (id == 'allCategories')
        {
            loadCategory(currentCategory);
        }
    }
})

function jsonp_uri(uri)
{
    return api_url + uri + (uri.indexOf('?') >= 0 ? '&' : '?') + 'apikey=' + api_key + '&callback=?';
}

function performSearch()
{

}

function loadCategory(catId)
{
    $('#actind').show();
    document.getElementById('categoriesList').clear();

    $.getJSON(jsonp_uri('categories/get?id=' + catId), function (data)
    {
        var categories = [];

        $.each(data.children_ids, function (key, val)
        {
            categories.push(val);
        });

        loadSubCategories(categories);
    });
}

function loadSubCategories(multi_ids)
{
    $.getJSON(jsonp_uri('categories/get_multi?ids=' + JSON.stringify(multi_ids)), function (data)
    {
        $('#actind').hide();

        var categoriesList = document.getElementById('categoriesList');

        data.sort(sortCategories);

        $.each(data, function (key, val)
        {
            var singleItem = document.createElement('div');
            singleItem.setAttribute('data-bb-type', 'item');
            singleItem.setAttribute('data-bb-title', val.nodename);
            singleItem.innerHTML = "(" + addCommas(val.num_parts) + ")";

            singleItem.onclick = function ()
            {
                previousCategory = currentCategory;
                currentCategory = val.id;
                bb.pushScreen('categories.html', 'allCategories');
            };

            categoriesList.appendItem(singleItem);
        });
    });
}

function sortCategories(a, b)
{
    var nameA = a.nodename.toLowerCase(), nameB = b.nodename.toLowerCase()
    if (nameA < nameB) //sort string ascending
        return -1
    if (nameA > nameB)
        return 1
    return 0 //default return value (no sorting)
}

function addCommas(str)
{
    var amount = new String(str);
    amount = amount.split("").reverse();

    var output = "";
    for (var i = 0; i <= amount.length - 1; i++)
    {
        output = amount[i] + output;
        if ((i + 1) % 3 == 0 && (amount.length - 1) !== i)output = ',' + output;
    }
    return output;
}