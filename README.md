## kendo-elasticsearch

A Kendo DataSource extension so you can load data into your [Kendo UI Grid](http://docs.telerik.com/kendo-ui/api/javascript/ui/grid) from an [ElasticSearch](https://www.elasticsearch.org/) index.

It supports filtering, searching and sorting in ElasticSearch for date and string fields. Other scenarios are not deliberately supported and have not been tested.

### Usage

Here is an example HTML file defining a Kendo grid talking to ElasticSearch:

```
<!DOCTYPE html>
<html>
  <head>
	<title>ElasticSearch Kendo DataSource example</title>
    <link href="http://cdn.kendostatic.com/2014.1.318/styles/kendo.common.min.css" rel="stylesheet">
	<link href="http://cdn.kendostatic.com/2014.1.318/styles/kendo.default.min.css" rel="stylesheet">

    <!-- Include dependencies -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.10.3/moment.min.js"></script>
    <script src="https://code.jquery.com/jquery-2.1.4.min.js"></script>
    <script src="http://cdn.kendostatic.com/2014.1.318/js/kendo.web.min.js"></script>

    <!-- Include kendo-elasticsearch itself -->
    <script src="kendo-elasticsearch.js"></script>
  
  </head>
  <body>
	<div id="example">
	  <div id="grid"></div>

	  <script>
		$(document).ready(function () {
		  $('#grid').kendoGrid({

			// so here go configuration options for the Kendo UI Grid

			// configure the datasource to be an ElasticSearchDataSource
			dataSource: new kendo.data.ElasticSearchDataSource({

			  // point it to the URL where ElasticSearch search requests can go
			  transport: {
				read: {
				  //other urls:
				  // http://localhost:9200/logstash-*/_search/
				  // http://localhost:9200/index1,index2,index3/_search/
				  url: "http://localhost:9200/_all/_search/"
				}
			  },

			  pageSize: 20,

			  // specify the fields to bind
			  schema: {
				model: {
				  fields: {
					message: { type: "string" },
					event_data_timestamp: { type:"datetime", esName:"event.data.timestamp"},
					other: { type:"string"},

					// you can specify a different ElasticSearch name for the field,
					// to deal with ElasticSearch field names that Kendo can't handle
					timestamp: { type: "datetime", esName: "@timestamp" }
				  }
				}
			  },

			  // server-side paging, filtering and sorting are enabled by default.
			  // Set filters as you like
			  sort: { field: "timestamp", dir: "desc" },
			  filter: 	[	
							{
								"logic":"and",
								"filters":[
									{ field: "message", operator: "eq", value: "accepted" },
									{ field: "other", operator: "neq", value: "0" }
								]
							}
						]
			}),

			// other grid options besides the datasource
			sortable: true,
			pageable: true,
			filterable: true,
			columns: [
			  { field: "timestamp" },
			  { field: "message" },
			  { field: "event_data_timestamp"},
			  { field: "other"}
			]
		  });
		});
	  </script>
	</div>
  </body>
</html>
```

### Dependencies

Requires kendo-ui and also [Moment.js](http://momentjs.com/).
