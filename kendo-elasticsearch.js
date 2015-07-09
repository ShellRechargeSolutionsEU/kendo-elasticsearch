/**
 * A Kendo DataSource that gets its data from ElasticSearch.
 *
 * Read-only, supports paging, filtering and sorting.
 */
(function(kendo) {
    'use strict';

    var data = kendo.data;

    if (!window.moment) throw new Error('Moment.js has to be loaded for ElasticSearchDataSource to work');

    // Helper functions for conversion of query parameters from Kendo to ElasticSearch format
    function arrayify(myArg) {
        var _argArray = [];

        if(myArg && myArg.constructor == Array) {
            _argArray = myArg;
        }
        else {
            if (!(myArg === void 0))
                _argArray.push(myArg);
        }

        return _argArray;
    }

    data.ElasticSearchDataSource = data.DataSource.extend({
       init: function(initOptions) {
           var self = this;

           if (!initOptions.transport || !initOptions.transport.read || !initOptions.transport.read.url)
               throw new Error('transport.read.url must be set to use ElasticSearchDataSource');

           initOptions.transport.read.dataType = initOptions.transport.read.dataType || 'json';

           // Create a map mapping Kendo field names to ElasticSearch field names. We have to allow ElasticSearch field
           // names to be different because ES likes an "@" in field names while Kendo fails on that.
           var fields = initOptions.schema.model.fields;
           this._esFieldMap = [];
           for (var k in fields) {
               if (fields.hasOwnProperty(k)) {
                   this._esFieldMap[k] = fields[k].hasOwnProperty('esName')
                                           ? fields[k].esName
                                           : k;
               }
           }

           initOptions.transport.parameterMap = function(data, type) {
               var sortParams = arrayify(data.sort);

               var esParams = {};
               if (data.skip) esParams.from = data.skip;
               if (data.take) esParams.size = data.take;

               if (sortParams.length > 0)
                   esParams.sort = self._esFieldMap[sortParams[0].field] + ":" + sortParams[0].dir;

               if (data.filter)
                   esParams.q = self._kendoFilterToESParam(data.filter);

               return esParams;
           };

           var schema = initOptions.schema;
           schema.parse = function(response) {
               var hits = response.hits.hits;
               var dataItems = [];
               for (var i = 0; i < hits.length; i++) {
                   var hitSource = hits[i]._source;
                   var dataItem = {};

                   dataItem.id = hits[i]._id;
                   for (var k in self._esFieldMap) {
                       dataItem[k] = hitSource[self._esFieldMap[k]];
                   }

                   dataItems.push(dataItem);
               }
               return {
                   total: response.hits.total,
                   data: dataItems
               };
           };

           schema.data = schema.data || 'data';
           schema.total = schema.total || 'total';
           schema.model.id = schema.model.id || '_id';

           initOptions.serverFiltering =  initOptions.serverFiltering || true;
           initOptions.serverSorting = initOptions.serverSorting || true;
           initOptions.serverPaging = initOptions.serverPaging || true;

           data.DataSource.fn.init.call(this, initOptions);
       },

       _kendoFilterToESParam: function(kendoFilterObj) {
            // there are three possible structures for the kendoFilterObj:
            //  * {value: "...", operator: "...", field: " ..."}
            //  * {logic: "...", filters: ...}
            //  * [ ... ]

            if (kendoFilterObj.operator) {
                return this._kendoOperatorFilterToESParam(kendoFilterObj);
            } else if (kendoFilterObj.logic) {
                return this._kendoFilterListToESParam(kendoFilterObj.logic, kendoFilterObj.filters);
            } else if (kendoFilterObj.constructor == Array) {
                return this._kendoFilterListToESParam("and", kendoFilterObj.filters);
            } else {
                throw new Error("Don't know how to turn this Kendo filter object into ElasticSearch search parameter: "
                                + kendoFilterObj);
            }
        },

        _kendoOperatorFilterToESParam: function(kendoFilterObj) {
            var fieldEscaped = this._asESParameter(this._esFieldMap[kendoFilterObj.field]);
            var valueEscaped = this._asESParameter(kendoFilterObj.value);

            var simpleBinaryOperators = {
                eq: "",
                lt: "<",
                lte: "<=",
                gt: ">",
                gte: ">="
            };

            if (simpleBinaryOperators[kendoFilterObj.operator] !== void 0) {
                var esOperator = simpleBinaryOperators[kendoFilterObj.operator];
                return fieldEscaped + ":" + esOperator + valueEscaped;
            } else {
                switch (kendoFilterObj.operator) {
                    case "neq":
                        return "NOT (" + fieldEscaped + ":" + valueEscaped + ")";
                    case "contains":
                        return fieldEscaped + ":*" + valueEscaped + "*";
                    case "startswith":
                        return fieldEscaped + ":" + valueEscaped + "*";
                    case "endswith":
                        return fieldEscaped + ":*" + valueEscaped;
                    default:
                        throw new Error("Kendo search operator '" + kendoFilterObj.operator + "' is not yet supported");
                }
            }
        },

        // logicalConnective can be "and" or "or"
        _kendoFilterListToESParam: function(logicalConnective, filters) {
            var esParams = [];

            for (var i = 0; i < filters.length; i++) {
                esParams.push(" (" + this._kendoFilterToESParam(filters[i]) + ") ");
            }

            return esParams.join(logicalConnective.toUpperCase())
        },

        _asESParameter: function(value) {
            if (value.constructor == Date)
                value = value.toISOString();

            return value.replace("\\", "\\\\").replace(/[+\-&|!()\{}\[\]^:"~*?:\/ ]/g, "\\$&");
        }
    })

})(window.kendo);
