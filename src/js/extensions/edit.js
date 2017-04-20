Tabulator.extensions.edit = {
		//default data editors
		editors:{
			input:function(cell, value, data){
				//create and style input
				var input = $("<input type='text'/>");
				input.css({
					"padding":"4px",
					"width":"100%",
					"box-sizing":"border-box",
				})
				.val(value);

				if(cell.hasClass("tabulator-cell")){
					setTimeout(function(){
						input.focus();
					},100);
				}

				//submit new value on blur
				input.on("change blur", function(e){
					cell.trigger("editval", input.val());
				});

				//submit new value on enter
				input.on("keydown", function(e){
					if(e.keyCode == 13){
						cell.trigger("editval", input.val());
					}
				});

				return input;
			},
			textarea:function(cell, value, data){
				var self = this;

				var count = (value.match(/(?:\r\n|\r|\n)/g) || []).length + 1;
				var row = cell.closest(".tabulator-row")

	            //create and style input
	            var input = $("<textarea></textarea>");
	            input.css({
	            	"display":"block",
	            	"height":"100%",
	            	"width":"100%",
	            	"padding":"2px",
	            	"box-sizing":"border-box",
	            	"white-space":"pre-wrap",
	            	"resize": "none",
	            })
	            .val(value);

	            if(cell.hasClass("tabulator-cell")){
	            	setTimeout(function(){
	            		input.focus();
	            	},100);
	            }

	            //submit new value on blur
	            input.on("change blur", function(e){
	            	cell.trigger("editval", input.val());
	            	setTimeout(function(){
	            		self._resizeRow(row);
	            	},300)
	            });

	            input.on("keyup", function(){
	            	var value = $(this).val();
	            	var newCount = (value.match(/(?:\r\n|\r|\n)/g) || []).length + 1;

	            	if(newCount != count){
	            		var line = input.innerHeight() / count;

	            		input.css({"height": (line * newCount) + "px"});

	            		self._resizeRow(row);

	            		count = newCount;
	            	}
	            });

	            return input;
	        },
	        number:function(cell, value, data){
				//create and style input
				var input = $("<input type='number'/>");
				input.css({
					"padding":"4px",
					"width":"100%",
					"box-sizing":"border-box",
				})
				.val(value);

				if(cell.hasClass("tabulator-cell")){
					setTimeout(function(){
						input.focus();
					},100);
				}

				//submit new value on blur
				input.on("blur", function(e){
					cell.trigger("editval", input.val());
				});

				//submit new value on enter
				input.on("keydown", function(e){
					if(e.keyCode == 13){
						cell.trigger("editval", input.val());
					}
				});

				return input;
			},
			star:function(cell, value, data){

				var maxStars = $("svg", cell).length;
				maxStars = maxStars ?maxStars : 5;

				var size = $("svg:first", cell).attr("width")
				size = size ? size : 14;

				var stars=$("<div style='vertical-align:middle; padding:4px; display:inline-block; vertical-align:middle;'></div>");

				value = parseInt(value) < maxStars ? parseInt(value) : maxStars;

				var starActive = $('<svg width="' + size + '" height="' + size + '" class="tabulator-star-active" viewBox="0 0 512 512" xml:space="preserve" style="padding:0 1px;"><polygon fill="#488CE9" stroke="#014AAE" stroke-width="37.6152" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" points="259.216,29.942 330.27,173.919 489.16,197.007 374.185,309.08 401.33,467.31 259.216,392.612 117.104,467.31 144.25,309.08 29.274,197.007 188.165,173.919 "/></svg>');
				var starInactive = $('<svg width="' + size + '" height="' + size + '" class="tabulator-star-inactive" viewBox="0 0 512 512" xml:space="preserve" style="padding:0 1px;"><polygon fill="#010155" stroke="#686868" stroke-width="37.6152" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" points="259.216,29.942 330.27,173.919 489.16,197.007 374.185,309.08 401.33,467.31 259.216,392.612 117.104,467.31 144.25,309.08 29.274,197.007 188.165,173.919 "/></svg>');

				for(var i=1;i<= maxStars;i++){

					var nextStar = i <= value ? starActive : starInactive;
					stars.append(nextStar.clone());
				}

				//change number of active stars
				var starChange = function(element){
					if($(".tabulator-star-active", element.closest("div")).length != element.prevAll("svg").length + 1){
						element.prevAll("svg").replaceWith(starActive.clone());
						element.nextAll("svg").replaceWith(starInactive.clone());
						element.replaceWith(starActive.clone());
					}
				}

				stars.on("mouseover", "svg", function(e){
					e.stopPropagation();
					starChange($(this));
				});

				stars.on("mouseover", function(e){
					$("svg", $(this)).replaceWith(starInactive.clone());
				});

				stars.on("click", function(e){
					$(this).closest(".tabulator-cell").trigger("editval", 0);
				});

				stars.on("click", "svg", function(e){
					var val = $(this).prevAll("svg").length + 1;
					cell.trigger("editval", val);
				});

				cell.css({
					"white-space": "nowrap",
					"overflow": "hidden",
					"text-overflow": "ellipsis",
				});

				cell.on("blur", function(){
					$(this).trigger("editcancel");
				});

				//allow key based navigation
				cell.on("keydown", function(e){
					switch(e.keyCode){
						case 39: //right arrow
						starChange($(".tabulator-star-inactive:first", stars));
						break;

						case 37: //left arrow
						var prevstar = $(".tabulator-star-active:last", stars).prev("svg");

						if(prevstar.length){
							starChange(prevstar);
						}else{
							$("svg", stars).replaceWith(starInactive.clone());
						}
						break;

						case 13: //enter
						cell.trigger("editval", $(".tabulator-star-active", stars).length);
						break;

					}
				});

				return stars;
			},
			progress:function(cell, value, data){
				//set default parameters
				var max = $("div", cell).data("max");
				var min = $("div", cell).data("min");

				//make sure value is in range
				value = parseFloat(value) <= max ? parseFloat(value) : max;
				value = parseFloat(value) >= min ? parseFloat(value) : min;

				//workout percentage
				var percent = (max - min) / 100;
				value = 100 - Math.round((value - min) / percent);

				cell.css({
					padding:"0 4px",
				});

				cell.attr("aria-valuemin", min).attr("aria-valuemax", max)


				var newVal = function(){
					var newval = (percent * Math.round(bar.outerWidth() / (cell.width()/100))) + min;
					cell.trigger("editval", newval);
					cell.attr("aria-valuenow", newval).attr("aria-label", value);
				}

				var bar = $("<div style='position:absolute; top:8px; bottom:8px; left:4px; right:" + value + "%; margin-right:4px; background-color:#488CE9; display:inline-block; max-width:100%; min-width:0%;' data-max='" + max + "' data-min='" + min + "'></div>");

				var handle = $("<div class='tabulator-progress-handle' style='position:absolute; right:0; top:0; bottom:0; width:5px;'></div>");

				bar.append(handle);

				handle.on("mousedown", function(e){
					bar.data("mouseDrag", e.screenX);
					bar.data("mouseDragWidth", bar.outerWidth());
				});

				handle.on("mouseover", function(){$(this).css({cursor:"ew-resize"})});

				cell.on("mousemove", function(e){
					if(bar.data("mouseDrag")){
						bar.css({width: bar.data("mouseDragWidth") + (e.screenX - bar.data("mouseDrag"))})
					}
				});

				cell.on("mouseup", function(e){
					if(bar.data("mouseDrag")){
						e.stopPropagation();
						e.stopImmediatePropagation();

						bar.data("mouseDragOut", true);
						bar.data("mouseDrag", false);
						bar.data("mouseDragWidth", false);

						newVal();

					}
				});

				//allow key based navigation
				cell.on("keydown", function(e){
					switch(e.keyCode){
						case 39: //right arrow
						bar.css({"width" : bar.width() + cell.width()/100});
						break;

						case 37: //left arrow
						bar.css({"width" : bar.width() - cell.width()/100});
						break;

						case 13: //enter
						newVal();
						break;

					}
				});

				cell.on("blur", function(){
					$(this).trigger("editcancel");
				});

				return bar;
			},

			tickCross:function(cell, value, data){
				//create and style input
				var input = $("<input type='checkbox'/>");
				input.css({
					"margin-top":"5px",
					"box-sizing":"border-box",
				})
				.val(value);

				if(cell.hasClass("tabulator-cell")){
					setTimeout(function(){
						input.focus();
					},100);
				}

				if(value === true || value === "true" || value === "True" || value === 1){
					input.prop("checked", true);
				}else{
					input.prop("checked", false);
				}

				//submit new value on blur
				input.on("change blur", function(e){
					cell.trigger("editval", input.is(":checked"));
				});

				//submit new value on enter
				input.on("keydown", function(e){
					if(e.keyCode == 13){
						cell.trigger("editval", input.is(":checked"));
					}
				});

				return input;
			},

			tick:function(cell, value, data){
				//create and style input
				var input = $("<input type='checkbox'/>");
				input.css({
					"margin-top":"5px",
					"box-sizing":"border-box",
				})
				.val(value);

				if(cell.hasClass("tabulator-cell")){
					setTimeout(function(){
						input.focus();
					},100);
				}

				if(value === true || value === "true" || value === "True" || value === 1){
					input.prop("checked", true);
				}else{
					input.prop("checked", false);
				}

				//submit new value on blur
				input.on("change blur", function(e){
					cell.trigger("editval", input.is(":checked"));
				});

				//submit new value on enter
				input.on("keydown", function(e){
					if(e.keyCode == 13){
						cell.trigger("editval", input.is(":checked"));
					}
				});

				return input;
			},
		},
}