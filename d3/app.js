+function () {
  'use strict';

  var demoApp = angular.module('demoApp', []);

  demoApp.controller('BarChartCtrl', ['$scope', function ($scope) {
    $scope.chart = [4, 8, 15, 16, 23, 42];

    $scope.chartStr = [4, 8, 15, 16, 23, 42];
    $scope.$watchCollection('chartStr', function () {
      $scope.chart.length = 0;
      angular.forEach($scope.chartStr, function (val) {
        $scope.chart.push(+val);
      });
    });
  }]);

  demoApp.directive('ksBarChart', ['$window', function ($window) {
    var BAR_HEIGHT = 20;

    return {
      restrict: 'E',
      scope: {
        data: '='
      },
      template: '<div class="BarChart"><svg></svg></div>',
      link: function (scope, el) {
        var bar, chart, scale,
          parentDiv, width, rect, text, forceDigest, refresh;

        forceDigest = function () {
          scope.$apply();
        };

        parentDiv = el.find('div')[0];
        width = parentDiv.clientWidth;

        scale = d3.scale.linear()
          .domain([0, d3.max(scope.data)])
          .range([0, width]);

        refresh = function () {
          var exit, gs, group;

          scale.domain([0, d3.max(scope.data)]);

          chart = d3.select(el.find('svg')[0])
            .attr('width', width)
            .attr('height', BAR_HEIGHT * scope.data.length);

          bar = chart.selectAll('g').data(scope.data)

          group = bar.enter()
            .append('g')
              .attr('transform', function (d, i) {
                return 'translate(0, ' + (i*BAR_HEIGHT) + ')';
              });

          group.append('rect')
            .attr('height', BAR_HEIGHT - 1);

          group.append('text')
            .attr('y', BAR_HEIGHT / 2)
            .attr('dy', '.35em');

          rect = bar.select('rect');
          rect.attr('width', scale);

          text = bar.select('text')
          text.attr('x', function (d) { return scale(d) - 3; })
            .text(function (d) { return d; });

          bar.exit().remove();
        };

        refresh();

        scope.$watch(function () {
          return parentDiv.clientWidth;
        }, function () {
          width = parentDiv.clientWidth;

          scale.range([0, width]);
          chart.attr('width', width);
          rect.attr('width', scale);
          text.attr('x', function (d) { return scale(d) - 3; });
        });

        scope.$watchCollection('data', function () {
          refresh();
        });

        angular.element($window).on('resize', forceDigest);

        scope.$on('$destroy', function () {
          angular.element($window).off('resize', forceDigest);
        });
      }
    };
  }]);

  demoApp.controller('TimeSeriesCtrl', [
    '$scope',
    function ($scope) {
    // Monthly values of the Southern Oscillation Index, 1950-1995.
    var dataset = [2.993, 1.293, -1.006, -0.80696, -1.406, -0.20696, -2.006,
      -0.90696, -1.806, -2.006, -1.306, -1.306, -1.706, -1.506, 0.29374, -0.60696,
      1.2937, 1.0937, 0.99374, -0.40696, -0.10696, 0.59374, -0.0069619, -2.306,
      0.69374, -1.306, -1.106, 0.19374, -3.306, -0.20696, 0.093738, -2.806,
      -2.106, -0.0069619, -0.40696, -0.80696, 1.2937, -0.90696, -0.20696, 0.89374,
      0.69374, -0.20696, 0.69374, 1.5937, 0.59374, 0.39374, 0.49374, 2.6937,
      -0.80696, 3.1937, 0.39374, -0.50696, 1.6937, 1.9937, 2.9937, 2.2937, 2.7937,
      2.7937, 2.4937, 1.9937, 2.5937, 2.6937, 1.7937, 1.4937, 2.4937, 1.5937,
      1.9937, 1.7937, 0.29374, 3.2937, 0.39374, 1.9937, 1.2937, -0.50696,
      -0.30696, 0.29374, -1.406, -0.10696, 0.39374, -1.406, -1.506, -0.0069619,
      -1.706, -0.60696, -3.506, -1.306, -0.20696, 0.49374, -1.206, 0.093738,
      0.69374, 1.2937, -0.40696, -0.10696, -0.70696, -1.106, -1.706, -2.906,
      1.6937, 0.59374, 0.69374, -0.60696, -0.50696, -0.60696, 0.29374, 0.79374,
      1.8937, 1.6937, 0.29374, -0.10696, 1.1937, 1.2937, 0.79374, -0.20696,
      0.89374, 1.0937, 1.3937, 0.093738, 1.1937, 1.5937, -0.40696, 1.3937, -4.206,
      1.3937, 0.49374, -0.20696, 0.49374, -0.10696, 0.39374, -0.80696, 1.1937,
      2.8937, 3.8937, -0.80696, -0.40696, 0.19374, 1.8937, 0.89374, 0.093738,
      0.89374, 1.0937, 1.6937, 0.69374, 0.39374, 2.0937, 0.89374, 1.3937, 1.2937,
      0.49374, -1.306, -0.20696, -0.50696, -0.80696, -2.406, -1.406, -2.306,
      -0.60696, -0.20696, 1.3937, 1.9937, 0.19374, 0.99374, 0.99374, 2.4937,
      2.5937, 2.2937, 0.39374, -0.60696, -0.80696, 0.39374, 0.69374, -1.106,
      0.093738, -1.406, -3.306, -1.706, -2.206, -1.706, -2.606, 0.29374, -2.506,
      -0.80696, -2.506, -0.50696, -0.80696, 0.29374, 0.093738, 0.79374, -0.10696,
      -0.30696, 0.093738, -0.70696, 3.2937, 2.8937, 1.5937, -0.10696, -0.20696,
      0.89374, 0.29374, 0.99374, 1.2937, -0.0069619, -0.70696, -1.106, 0.89374,
      2.0937, -0.50696, -0.10696, 2.1937, 1.6937, 1.2937, 0.093738, -0.20696,
      -0.20696, -0.40696, 0.39374, -2.906, -1.506, 0.093738, -0.80696, -0.60696,
      -0.0069619, -0.90696, -0.60696, -1.706, -1.906, -0.0069619, 0.79374, -2.006,
      -2.406, 0.39374, -0.30696, 0.49374, 1.4937, -0.70696, 0.69374, 2.3937,
      1.7937, 3.0937, 3.5937, 0.69374, 3.3937, 3.6937, 3.0937, 1.4937, 0.49374,
      0.39374, 2.4937, 2.9937, 3.0937, 1.1937, 0.39374, 0.89374, 1.6937, 0.39374,
      -0.30696, -3.106, -1.506, -2.806, -1.306, -2.306, -1.706, -0.40696, -2.306,
      -0.50696, -2.906, 0.59374, -0.0069619, 0.69374, 1.5937, 1.1937, 1.9937,
      2.5937, 1.2937, 4.9937, 3.4937, 4.5937, 3.4937, 3.8937, 1.6937, 1.6937,
      0.39374, 2.1937, 1.0937, 2.2937, 1.5937, -0.20696, 0.29374, -1.006, 1.2937,
      2.1937, 1.9937, 1.0937, 2.0937, 3.6937, 3.3937, 4.1937, 3.0937, 2.3937,
      3.9937, 2.6937, 2.8937, 2.4937, 0.49374, 0.59374, 0.093738, -1.606, -1.906,
      -1.906, 0.69374, 1.3937, -0.70696, -0.80696, 1.9937, -1.806, -1.006, -1.106,
      -2.206, -2.206, -1.906, -1.306, -2.006, -2.206, -2.006, -0.40696, -5.406,
      -1.006, -0.70696, 2.3937, 0.79374, 0.99374, 0.29374, 0.39374, -0.90696,
      0.093738, -0.10696, -0.80696, 1.5937, -0.50696, -0.40696, 0.79374, 0.89374,
      2.4937, -0.70696, 0.49374, -0.30696, -0.70696, -1.306, 0.79374, 0.29374,
      -1.706, -1.406, -0.20696, -0.40696, -0.10696, 0.29374, -0.60696, -0.10696,
      -0.50696, -0.20696, 0.69374, -0.70696, -3.106, -0.40696, 1.3937, 1.9937,
      1.4937, 0.89374, 0.89374, -0.90696, 0.39374, 0.99374, 2.4937, 0.19374,
      0.39374, -0.0069619, -0.80696, -2.306, -2.906, -3.706, -3.006, -3.306,
      -4.806, -4.306, -6.606, -7.306, -5.306, -1.906, 0.99374, -0.20696, -1.006,
      -0.0069619, 1.9937, 0.69374, -0.0069619, 0.093738, 0.49374, 1.1937, -1.206,
      0.59374, 0.19374, -1.006, 0.39374, 0.39374, 0.49374, -0.70696, 0.69374,
      -0.40696, -0.40696, 1.9937, 0.59374, 1.9937, 0.59374, -1.206, -0.10696,
      1.3937, 0.19374, -0.90696, -0.20696, 0.49374, 1.7937, -2.406, 0.19374,
      0.39374, -0.60696, 1.3937, 0.49374, -1.306, -0.70696, 1.1937, -2.206,
      -2.706, -1.206, -2.806, -3.006, -2.706, -2.506, -2.506, -2.506, -2.206,
      -1.606, -0.80696, 0.093738, -0.90696, -0.0069619, -1.106, 0.39374, 0.19374,
      1.5937, -0.10696, 1.9937, 2.4937, 3.6937, 2.4937, 3.2937, 2.3937, 2.9937,
      2.0937, 1.2937, 2.8937, 2.1937, 1.0937, 1.6937, -1.006, 1.1937, 1.2937,
      -0.30696, -0.90696, -0.10696, -3.606, -1.606, 0.19374, 2.0937, 0.19374,
      1.0937, -0.70696, -1.006, 0.39374, -0.80696, -0.40696, 1.2937, 0.19374,
      -1.906, -1.406, -2.106, -0.60696, 0.093738, -1.106, -2.606, -2.106, -1.106,
      -3.406, -5.306, -2.006, -4.506, -2.006, 0.39374, -1.606, -1.006, 0.29374,
      0.29374, -2.906, -1.106, -1.106, -1.706, -1.806, -1.506, -2.306, -0.70696,
      -1.906, -1.506, -2.106, -1.006, -2.206, -0.0069619, 0.39374, -0.20696,
      0.19374, -1.906, -2.606, -1.406, -1.206, -2.606, -2.706, -2.706, -2.306,
      -0.90696, -2.306, -0.70696, -0.50696, 0.69374, -1.506, -0.90696, -0.10696,
      0.89374, 0.19374, 0.79374, -0.20696, 0.19374, -1.006];

    var unicorns = [-0.000, -0.848, -1.737, -1.825, -2.806, -2.335, -4.686, -5.218,
      -7.658, -9.663, -9.753, -11.057, -12.844, -11.875, -11.304, -11.333,
      -13.994, -12.092, -10.323, -8.196, -6.031, -7.130, -8.019, -6.660, -4.794,
      -3.393, -3.008, -5.274, -5.897, -3.691, -1.871, -0.881, -1.899, 1.858,
      1.986, 1.447, 4.952, 3.694, 1.138, 0.512, 0.887, 0.726, -0.559, -1.352,
      -0.209, -3.754, -3.783, -3.514, -5.339, -3.598, -4.754, -2.531, -4.200,
      -2.989, -1.576, -1.432, -2.717, -3.090, -4.365, -4.282, -6.511, -9.538,
      -9.960, -9.178, -9.227, -8.871, -10.604, -11.353, -12.208, -11.561,
      -10.287, -10.622, -10.837, -10.495, -10.174, -13.086, -13.077, -14.565,
      -16.494, -15.802, -16.505, -16.626, -17.480, -15.571, -17.005, -16.211,
      -15.528, -13.502, -14.309, -12.244, -11.000, -15.754, -13.187, -13.148,
      -12.164, -11.012, -10.258, -8.964, -9.959, -12.082, -10.588, -10.620,
      -8.723, -7.472, -7.615, -9.121, -8.112, -7.344, -8.089, -7.784, -7.468,
      -6.783, -7.057, -7.785, -4.877, -5.793, -7.587, -8.400, -7.210, -6.504,
      -8.227, -8.512, -7.624, -8.753, -5.786, -4.758, -6.656, -4.369, -4.303,
      -5.186, -6.444, -6.753, -5.083, -6.990, -8.360, -8.780, -8.544, -8.131,
      -8.962, -10.576, -9.332, -9.479, -11.364, -11.434, -11.925, -12.996,
      -16.109, -17.854, -17.730, -14.962, -14.165, -14.673, -12.516, -13.697,
      -10.605, -8.845, -6.686, -5.101, -7.862, -7.722, -7.501, -5.482, -5.706,
      -7.504, -9.117, -6.545, -8.135, -6.880, -8.027, -6.648, -9.288, -11.922,
      -11.545, -9.917, -8.789, -10.066, -9.976, -13.393, -13.136, -12.089,
      -9.901, -11.245, -9.925, -11.367, -10.084, -9.707, -9.767, -7.189, -7.328,
      -10.745, -9.789, -8.783, -7.430, -8.140, -8.228, -9.902, -9.274, -6.949,
      -7.886, -6.625, -9.100, -10.739, -8.093, -7.879, -6.699, -6.710, -7.734,
      -7.959, -7.451, -9.318, -8.459, -6.905, -8.330, -8.489, -7.250, -8.105,
      -10.022, -10.227, -8.021, -6.298, -8.179, -9.877, -12.539, -12.694,
      -11.039, -11.046, -11.500, -10.923, -10.070, -8.618, -9.880, -8.477,
      -8.271, -8.298, -9.742, -11.232, -9.326, -10.369, -12.041, -13.229,
      -12.060, -8.459, -10.338, -11.163, -12.315, -14.876, -15.605, -18.598,
      -17.137, -17.989, -17.946, -18.414, -15.711, -15.588, -15.783, -15.323,
      -16.646, -15.363, -14.696, -17.072, -17.017, -17.831, -18.744, -17.272,
      -17.558, -19.093, -21.060, -21.563, -20.398, -21.933, -21.454, -22.250,
      -19.190, -19.714, -21.711, -19.822, -21.152, -20.775, -18.783, -17.003,
      -14.776, -14.056, -15.153, -14.448, -16.065, -17.567, -18.204, -17.314,
      -17.414, -18.837, -18.444, -17.014, -18.592, -17.738, -17.079, -16.741,
      -16.281, -15.919, -17.049, -15.106, -14.368, -13.842, -17.151, -15.736,
      -16.277, -16.908, -15.584, -16.777, -17.352, -16.483, -14.080, -12.002,
      -15.090, -16.445, -16.845, -19.263, -17.929, -17.804, -18.436, -17.966,
      -18.818, -18.074, -17.449, -14.814, -15.446, -14.965, -14.624, -14.928,
      -13.292, -12.930, -12.873, -14.355, -14.578, -13.723, -10.474, -8.028,
      -6.006, -5.252, -5.395, -5.586, -4.611, -4.126, -4.701, -5.154, -4.618,
      -2.875, -4.531, -5.427, -1.919, -3.845, -3.514, -3.967, -3.116, -3.699,
      -3.478, -3.758, -2.813, -3.851, -4.531, -5.320, -2.273, -2.806, -4.994,
      -6.559, -6.884, -8.775, -9.819, -10.448, -12.210, -10.883, -11.389, -9.454,
      -10.591, -9.074, -10.610, -9.570, -11.019, -10.935, -10.401, -10.198,
      -8.478, -8.411, -6.465, -7.261, -6.420, -5.564, -4.695, -3.516, -2.469,
      -1.992, -1.646, -4.825, -5.056, -7.016, -5.116, -2.699, -0.230, 3.169,
      1.388, 2.748, 4.260, 4.774, 5.174, 1.281, 3.283, 4.175, 3.442, 3.110,
      -0.026, 0.702, 0.773, -0.965, -2.219, -3.890, -5.662, -5.397, -4.542,
      -1.836, -0.607, -1.192, -2.914, -2.630, -3.226, -4.975, -7.565, -7.775,
      -9.064, -5.635, -6.191, -5.101, -5.628, -4.404, -3.489, -3.193, -2.230,
      -2.739, -1.731, -2.267, -3.118, -2.729, -3.201, -3.715, -2.163, -2.345,
      1.004, 3.588, 3.727, 6.324, 6.457, 7.604, 7.785, 4.407, 7.307, 7.659,
      6.189, 6.013, 5.402, 7.196, 10.029, 10.636, 12.357, 12.495, 12.315, 14.213,
      14.458, 15.781, 13.934, 11.601, 12.177, 12.243, 16.696, 20.440, 23.416,
      23.108, 21.095, 21.836, 20.969, 23.453, 26.252, 25.837, 24.404, 23.511,
      23.546, 20.283, 20.724, 21.888, 22.636, 23.160, 22.697, 21.291, 21.052,
      19.570, 19.854, 21.492, 20.370, 20.351, 20.135, 21.516, 20.347, 21.623,
      22.007, 23.765, 24.327, 25.794, 25.620, 23.424, 22.758, 23.814, 22.418,
      22.528, 23.089, 23.335, 25.581, 25.385, 25.794, 23.872, 25.377, 24.187,
      23.963, 24.581, 24.617, 26.343, 25.926, 22.247, 23.718, 24.217, 22.588,
      22.946, 21.045, 19.947, 19.460, 19.123, 21.800, 19.115, 18.670, 19.272,
      18.438, 16.684, 16.941, 17.336];

    $scope.ts = [dataset, unicorns];
  }]);

  demoApp.directive('ksTimeSeries', function () {
    var MARGIN = {
      TOP: 20,
      RIGHT: 20,
      BOTTOM: 20,
      LEFT: 40
    };

    var uniqueId = 1; // runs out at 2^52-ish.

    function globalMin(datasets) {
      return d3.min(datasets.map(function (data) { return d3.min(data); }));
    }

    function globalMax(datasets) {
      return d3.max(datasets.map(function (data) { return d3.max(data); }));
    }

    function globalMaxLength(datasets) {
      return d3.max(datasets.map(function (data) { return data.length; }));
    }

    function createText(datas, index) {
      return datas.map(function (data, i) {
        return 'x' + i + ' = ' + data[index];
      }).join('\n');
    }

    return {
      restrict: 'E',
      scope: {
        data: '='
      },
      template: '<div class="TimeSeries"><svg></svg></div>',
      link: function (scope, el) {
        var parentDiv, tscale, xscale, width, height, refresh, svg, path, line,
          clipPathId = uniqueId++,
          tooltip,
          pathWrapper;

        parentDiv = el.find('div')[0];
        width = parentDiv.clientWidth - (MARGIN.LEFT + MARGIN.RIGHT);
        height = parentDiv.clientHeight - (MARGIN.TOP + MARGIN.BOTTOM);

        tscale = d3.scale.linear()
          .domain([0, globalMaxLength(scope.data)])
          .range([0, width]);

        xscale = d3.scale.linear()
          .domain([globalMin(scope.data), globalMax(scope.data)])
          .range([height, 0]);

        var svg = d3.select(el.find('svg')[0])
            .attr('width', parentDiv.clientWidth)
            .attr('height', parentDiv.clientHeight)
          .append('g')
            .attr('transform', 'translate(' + MARGIN.LEFT + ',' + MARGIN.TOP + ')');

        svg.append('defs').append('clipPath')
            .attr('id', 'tsclip-' + clipPathId)
          .append('rect')
            .attr('width', width)
            .attr('height', height);

        svg.append('g')
          .attr('class', 't axis')
          .attr('transform', 'translate(0,' + xscale(globalMin(scope.data)) + ')')
          .call(d3.svg.axis().scale(tscale).orient('bottom'));

        svg.append('g')
          .attr('class', 'x axis')
          .call(d3.svg.axis().scale(xscale).orient('left'));

        pathWrapper = svg.append('g')
            .attr('class', 'path-wrapper')
            .attr('clip-path', 'url(#tsclip-' + clipPathId + ')');

        pathWrapper.append('rect')
          .attr('class', 'event-target')
          .attr('width', width)
          .attr('height', height);

        angular.forEach(scope.data, function (data) {
          line = d3.svg.line()
            .x(function (d, i) { return tscale(i); })
            .y(function (d, i) { return xscale(d); });

          path = pathWrapper.append('path')
            .datum(data)
            .attr('class', 'line')
            .attr('d', line);
        });

        tooltip = angular.element('<pre class="TimeSeries-tooltip"></pre>')
          .css({ display: 'none', position: 'absolute' });
        angular.element(document.body).append(tooltip);

        svg.on('mouseover', function () {
          var coords = d3.mouse(svg.select('.path-wrapper')[0][0]),
            tIndex = Math.round(tscale.invert(coords[0]));

          tooltip.text(createText(scope.data, tIndex))
            .css({
              display: 'block',
              left: (d3.event.pageX+5) + 'px',
              top: (d3.event.pageY+5) + 'px'
            });
        });

        svg.select('.path-wrapper').on('mouseleave', function () {
          tooltip.css({ display: 'none' });
        });

        refresh = function () {
          tscale.domain([0, globalMaxLength(scope.data)]);
          xscale.domain([globalMin(scope.data), globalMax(scope.data)]);

          svg.select('g.t').remove();
          svg.append('g')
            .attr('class', 't axis')
            .attr('transform', 'translate(0,' + xscale(globalMin(scope.data)) + ')')
            .call(d3.svg.axis().scale(tscale).orient('bottom'));

          svg.select('g.x').remove();
          svg.append('g')
            .attr('class', 'x axis')
            .call(d3.svg.axis().scale(xscale).orient('left'));

          angular.forEach(scope.data, function (data) {
            line = d3.svg.line()
              .x(function (d, i) { return tscale(i); })
              .y(function (d, i) { return xscale(d); });

            svg.select('.line').remove()
            svg.select('.path-wrapper').append('path')
              .datum(data)
              .attr('class', 'line')
              .attr('d', line);
          });
        };

        scope.$watchCollection('data', function () {
          refresh();
        });

        scope.$watch(function () {
          return parentDiv.clientWidth;
        }, function () {
          width = parentDiv.clientWidth - (MARGIN.LEFT + MARGIN.RIGHT);
          tscale.range([0, width]);

          d3.select(el.find('svg')[0])
            .attr('width', parentDiv.clientWidth);

          svg.select('#tsclip-' + clipPathId + ' rect')
            .attr('width', width);

          svg.select('g.t').remove();
          svg.append('g')
            .attr('class', 't axis')
            .attr('transform', 'translate(0,' + xscale(globalMin(scope.data)) + ')')
            .call(d3.svg.axis().scale(tscale).orient('bottom'));

          angular.forEach(scope.data, function (data) {
            line = d3.svg.line()
              .x(function (d, i) { return tscale(i); })
              .y(function (d, i) { return xscale(d); });

            svg.select('.line').remove()
            svg.select('.path-wrapper').append('path')
              .datum(data)
              .attr('class', 'line')
              .attr('d', line);
          });

          svg.select('.event-target')
            .attr('width', width);
        });
      }
    };
  });

  angular.bootstrap(document.body, ['demoApp']);
}();
