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
	<link href="kendo.common.min.css" rel="stylesheet">

	<!-- Include dependencies -->
	<script src="moment.min.js"></script>
	<script src="jquery.min.js"></script>
	<script src="kendo.web.min.js"></script>

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
				  url: "http://localhost:9200/_all/_search/"
				}
			  },

			  pageSize: 20,

			  // specify the fields to bind
			  schema: {
				model: {
				  fields: {
					message: { type: "string" },

					// you can specify a different ElasticSearch name for the field,
					// to deal with ElasticSearch field names that Kendo can't handle
					timestamp: { type: "date", esName: "@timestamp" }
				  }
				}
			  },

			  // server-side paging, filtering and sorting are enabled by default.
			  // Set filters as you like
			  sort: { field: "timestamp", dir: "desc" },
			  filter: { field: "message", operator: "eq", value: "accepted" }
			}),

			// other grid options besides the datasource
			sortable: true,
			pageable: true,
			filterable: true,
			columns: [
			  { field: "timestamp" },
			  { field: "message" }
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
