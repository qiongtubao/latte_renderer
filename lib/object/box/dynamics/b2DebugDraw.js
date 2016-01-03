(function(define) { 'use strict';
   define("latte_renderer/object/box/dynamics/b2DebugDraw", ["require", "exports", "module", "window"], 
   function(require, exports, module, window) {
      var DebugDraw = function() {
         this.m_drawScale = 1.0;
         this.m_lineThickness = 1.0;
         this.m_alpha = 1.0;
         this.m_fillAlpha = 1.0;
         this.m_xformScale = 1.0;
         var self = this;
         this.m_sprite = {
            graphics: {
               clear: function() {
                  self.m_ctx.clearRect(0,0, self.m_ctx.canvas.width, self.m_ctx.canvas.height);
               }
            }
         };
         this.init();
      };
      (function() {
         this.init = function() {
            this.m_drawFlags = 0;
         }
         /**
            @method setSprite
            @param sprite {canvas}
         */
         this.SetSprite = function(sprite) {
            this.m_ctx = sprite;
         }
         /**
            设置放大缩小的尺寸
            @method setDrawScale
            @param drawScale {Number}
         */
         this.SetDrawScale = function(drawScale) {
            if(drawScale === undefined) drawScale = 0;
            this.m_drawScale = drawScale;
         }
         /**
            设置填充透明度
            @method setFillAlpha
            @param alpha {Number}
         */
         this.SetFillAlpha = function(alpha) {
            if(alpha === undefined) alpha = 0;
            this.m_fillAlpha = alpha;
         }
         /**
            设置线宽
            @method setLineThickness
            @param lineThickness {Number}
         */
         this.SetLineThickness = function(lineThickness) {
            if(lineThickness === undefined) lineThickness = 0;
            this.m_lineThickness = lineThickness;
            this.m_ctx.strokeWidth = lineThickness;
         }

         /**
            @method setFlags
            @param flags {Number}
         */
         this.SetFlags = function(flags) {
            if(flags === undefined) flags = 0;
            this.m_drawFlags = flags;
         }

         this.GetFlags = function() {
            return this.m_drawFlags;
         }

         this.DrawSolidCircle = function(center, radius, axis, color) {
            if (!radius) return;
            var s = this.m_ctx,
               drawScale = this.m_drawScale,
               cx = center.x * drawScale,
               cy = center.y * drawScale;
            s.moveTo(0, 0);
            s.beginPath();
            s.strokeStyle = this._color(color.color, this.m_alpha);
            s.fillStyle = this._color(color.color, this.m_fillAlpha);
            s.arc(cx, cy, radius * drawScale, 0, Math.PI * 2, true);
            s.moveTo(cx, cy);
            s.lineTo((center.x + axis.x * radius) * drawScale, (center.y + axis.y * radius) * drawScale);
            s.closePath();
            s.fill();
            s.stroke();
         }

         this._color = function (color, alpha) {
            return "rgba(" + ((color & 0xFF0000) >> 16) + "," + ((color & 0xFF00) >> 8) + "," + (color & 0xFF) + "," + alpha + ")";
         };
         this.DrawSolidPolygon = function(vertices, vertexCount, color) {
            if (!vertexCount) return;
            var s = this.m_ctx;
            var drawScale = this.m_drawScale;
            s.beginPath();
            s.strokeStyle = this._color(color.color, this.m_alpha);
            s.fillStyle = this._color(color.color, this.m_fillAlpha);
            s.moveTo(vertices[0].x * drawScale, vertices[0].y * drawScale);
            for (var i = 1; i < vertexCount; i++) {
               s.lineTo(vertices[i].x * drawScale, vertices[i].y * drawScale);
            }
            s.lineTo(vertices[0].x * drawScale, vertices[0].y * drawScale);
            s.closePath();
            s.fill();
            s.stroke();
         }
      }).call(DebugDraw.prototype);
      (function() {
         this.e_shapeBit = 0x0001;
         this.e_jointBit = 0x0002;
         this.e_aabbBit = 0x0004;
         this.e_pairBit = 0x0008;
         this.e_centerOfMassBit = 0x0010;
         this.e_controllerBit = 0x0020;
      }).call(DebugDraw);
   	module.exports = DebugDraw;
   });
})(typeof define === "function"? define: function(name, reqs, factory) { factory(require, exports, module); } );