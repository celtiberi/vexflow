/**
 * VexFlow Test Support Library
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

var VF = Vex.Flow;
VF.Test = (function() {
  var Test = {
    // Test Options.
    RUN_CANVAS_TESTS: true,
    RUN_SVG_TESTS: true,
    RUN_RAPHAEL_TESTS: false,
    RUN_NODE_TESTS: false,

    // Where images are stored for NodeJS tests.
    NODE_IMAGEDIR: "images",

    // Default font properties for tests.
    Font: {size: 10},

    // Returns a unique ID for a test.
    genID: function() { return VF.Test.genID.ID++; },

    createTestCanvas: function(canvas_sel_name, test_name) {
      var sel = VF.Test.createTestCanvas.sel;
      var test_div = $('<div></div>').addClass("testcanvas");
      test_div.append($('<div></div>').addClass("name").text(test_name));
      test_div.append($('<canvas></canvas>').addClass("vex-tabdiv").
          attr("id", canvas_sel_name).
          addClass("name").text(name));
      $(sel).append(test_div);
    },

    createTestSVG: function(canvas_sel_name, test_name) {
      var sel = VF.Test.createTestCanvas.sel;
      var test_div = $('<div></div>').addClass("testcanvas");
      test_div.append($('<div></div>').addClass("name").text(test_name));
      test_div.append($('<div></div>').addClass("vex-tabdiv").
          attr("id", canvas_sel_name));
      $(sel).append(test_div);
    },

    resizeCanvas: function(sel, width, height) {
      $("#" + sel).width(width);
      $("#" + sel).attr("width", width);
      $("#" + sel).attr("height", height);
    },

    runTests: function(name, func, params) {
      if (VF.Test.RUN_CANVAS_TESTS) {
        VF.Test.runCanvasTest(name, func, params);
      }
      if (VF.Test.RUN_SVG_TESTS) {
        VF.Test.runSVGTest(name, func, params);
      }
      if (VF.Test.RUN_RAPHAEL_TESTS) {
        VF.Test.runRaphaelTest(name, func, params);
      }
      if (VF.Test.RUN_NODE_TESTS) {
        VF.Test.runNodeTest(name, func, params);
      }
    },

    runCanvasTest: function(name, func, params) {
      QUnit.test(name, function(assert) {
          var test_canvas_sel = "canvas_" + VF.Test.genID();
          var test_canvas = VF.Test.createTestCanvas(test_canvas_sel, name + " (Canvas)");
          func({
            canvas_sel: test_canvas_sel,
            params: params,
            assert: assert },
            VF.Renderer.getCanvasContext);
        });
    },

    runRaphaelTest: function(name, func, params) {
      QUnit.test(name, function(assert) {
          var test_canvas_sel = "canvas_" + VF.Test.genID();
          var test_canvas = VF.Test.createTestSVG(test_canvas_sel, name + " (Raphael)");
          func({
            canvas_sel: test_canvas_sel,
            params: params,
            assert: assert },
            VF.Renderer.getRaphaelContext);
        });
    },

    runSVGTest: function(name, func, params) {
      QUnit.test(name, function(assert) {
          var test_canvas_sel = "canvas_" + VF.Test.genID();
          var test_canvas = VF.Test.createTestSVG(test_canvas_sel, name + " (SVG)");
          func({
            canvas_sel: test_canvas_sel,
            params: params,
            assert: assert },
            VF.Renderer.getSVGContext);
        });
    },

    runNodeTest: function(name, func, params) {
      var jsdom = require("jsdom").jsdom;
      var xmldom = require("xmldom");
      var fs = require('fs');

      window = jsdom().defaultView;
      document = window.document;

      QUnit.test(name, function(assert) {
        var div = document.createElement("div");
        div.setAttribute("id", "canvas_" + VF.Test.genID());

        func({
          canvas_sel: div,
          params: params,
          assert: assert },
          VF.Renderer.getSVGContext);

        if (VF.Renderer.lastContext != null) {
          // If an SVG context was used, then serialize and save its contents to
          // a local file.
          var svgData = new xmldom.XMLSerializer().serializeToString(VF.Renderer.lastContext.svg);

          var moduleName = QUnit.current_module.replace(/[^a-zA-Z0-9]/g, "_");
          var testName = QUnit.current_test.replace(/[^a-zA-Z0-9]/g, "_");
          var filename = VF.Test.NODE_IMAGEDIR + "/" + moduleName + "." + testName + ".svg";
          fs.writeFile(filename, svgData, function(err) {
            if (err) {
              return console.log("Can't save file: " + filename + ". Error: " + err);
            }
          });
          VF.Renderer.lastContext = null;
        }
      });
    },

    plotNoteWidth: VF.Note.plotMetrics,
    plotLegendForNoteWidth: function(ctx, x, y) {
      ctx.save();
      ctx.setFont("Arial", 8, "");

      var spacing = 12;
      var lastY = y;

      function legend(color, text) {
        ctx.beginPath();
        ctx.setStrokeStyle(color)
        ctx.setFillStyle(color)
        ctx.setLineWidth(10);
        ctx.moveTo(x, lastY - 4);
        ctx.lineTo(x + 10, lastY - 4);
        ctx.stroke();

        ctx.setFillStyle("black");
        ctx.fillText(text, x + 15, lastY);
        lastY += spacing;
      }

      legend("green", "Note + Flag")
      legend("red", "Modifiers")
      legend("#999", "Displaced Head")
      legend("#DDD", "Formatter Shift")

      ctx.restore();
    }
  };

  Test.genID.ID = 0;
  Test.createTestCanvas.sel = "#vexflow_testoutput";

  return Test;
})();

module.exports = VF.Test;