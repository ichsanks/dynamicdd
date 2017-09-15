(function ($) {
    'use strict';

    $.fn.extend({
        dynamicdd: function (options) {
            // filter out <= IE6
            if (typeof document.body.style.maxHeight === 'undefined') {
                return this;
            }
            var defaults = {
                    customClass: 'dynamicdd',
                    height:      'auto',
                    mapClass:    true,
                    mapStyle:    true
            },
            options = $.extend(defaults, options),
            prefix = options.customClass,
            changed = function ($select, customSelect) {
                var currentSelected = $select.find(':selected'),
                	currentValue = currentSelected.val(),
                	customSelectText = customSelect.find('.dynamicdd-mask-selected span'),
                	html = currentSelected.text() || '&nbsp;';                	

                	customSelectText.html(html);
            },
            getClass = function(suffix){
                return prefix + suffix;
            },
            getData = function(src) {
            	var result = [];
            	$.ajax({
            		async: false,
            		url: src,
            		type: 'GET',
            		dataType: 'json',
            		success: function(response) {
            			$.each(response, function(key, val) {
            				result.push(val);
            			});
            		}
            	});
            	return result;
            },
            getAncestor = function(data, childId) {
                var result = [];
                $.each(data, function(key, val) {
                    if(val.id == childId) {
                        result.push(id);                        
                    }
                });
                if(result.length > 0){
                    return result;
                }
            },
            getChildren = function(data, parentId) {
            	var result = [];
                if(parentId) {
                    $.each(data, function(key, val) {
                        if(val.parentID == parentId) {
                            result.push(val);
                        }
                    });
                } else {
                    $.each(data, function(key, val) {                       
                        result.push(val);
                    });
                }

            	if(result.length > 0) {
            		return result;
            	}            	
            },
            renderList = function($select) {
            	var masklist = '';

                $.each($select.children(), function(key, val) {                    
                    var selectall = $(this).hasClass('selectall') ? ' selectall' : '';
                	if($(this).is('optgroup')) {
                		masklist += '<li class="group">'+$(this).attr('label')+'</li><ul class="group-list">';
                		$.each($(this).children(), function(i, v) {
                			if($(this).is(':disabled')) {
	                			masklist += '<li class="disabled">'+v.text+'</li>'
		                	} else {
		                		masklist += '<li data-value="'+v.value+'">'+v.text+'</li>';
		                	}
                		});             		
                		masklist += '</ul>';
                	} else {                                    
	                	if($(this).is(':disabled')) {
	                		masklist += '<li class="disabled'+selectall+'" data-value="'+val.value+'">'+val.text+'</li>'
	                	} else {
	                		masklist += '<li class="'+selectall+'" data-value="'+val.value+'">'+val.text+'</li>';
	                	}
	                }
                    
                });
                $select.closest('.dynamicdd').find('.dynamicdd-mask-list').append(masklist);
            },
            setName = function($select, list) {
                var wrapper = $select.closest('.dynamicdd-wrapper'),
                    customSelect = $select.closest('.dynamicdd'),
                    name = wrapper.data('name'),
                    index = $select.index();
                
                wrapper.find('select').removeAttr('name');                
                
                if(list && !$select.find(':selected').hasClass('selectall')) {
                    switch( wrapper.data('populate') ) {
                        case "last two" :
                            $select.attr('name', name+'[0]');
                            $select.closest('.dynamicdd').after('<select name="'+name+'[1]" class="form-control"></select>');
                            break;
                        default :
                            $select.closest('.dynamicdd').after('<select name="'+name+'" class="form-control"></select>');
                    }
                } else {
                    switch( wrapper.data('populate') ) {
                        case "last two" :                                                       
                            wrapper.children('.dynamicdd:last').find('select').attr('name',name+'[1]');
                            wrapper.children('.dynamicdd:last').prev().find('select').attr('name',name+'[0]');
                            break;
                        default :                
                            wrapper.children('.dynamicdd:last').find('select').attr('name',name);
                    }
                }

                customSelect.next().html(list).dynamicdd();
            }

            return this.each(function () {
                var $select = $(this),
                  	wrapperEl = $('<div class="dynamicdd-wrapper"></div>'),                    
                  	list = null,
                  	$wrapper = null,
                  	$customSelect = null,
                  	result = '';                

                if(!$select.closest('.dynamicdd-wrapper').length) {
                	$select.wrap(wrapperEl);

                    $wrapper = $select.closest('.dynamicdd-wrapper');              

                    $wrapper
                        .addClass($select.attr('class'))
                        .data('name', $select.attr('name'));

                	if($select.data('src')) {
                		$wrapper
                			.data('list', getData($select.data('src')));                			
            		}
                    if($select.data('populate')) {
                        $wrapper
                            .data('populate', $select.data('populate'));                        
                    }
                    if($select.data('placeholder')) {
                        $wrapper
                            .data('placeholder', $select.data('placeholder'));                        
                    }
                    if($select.data('drilled') === false) {
                        $wrapper
                            .data('drilled', $select.data('drilled'));                           
                    }
                    if($select.data('selected')) {
                        $wrapper
                            .data('selected', $select.data('selected'));
                    }
                }                

                $select.wrap('<div class="dynamicdd"></div>');

                $wrapper = $select.closest('.dynamicdd-wrapper');
                $customSelect = $select.closest('.dynamicdd');			                

                $select
                    .on('render.customSelect', function () {
                    	var customSelect = $('<div class="dynamicdd-mask">\
                    							<div class="dynamicdd-mask-selected">\
                    								<i class="dynamicdd-caret fa fa-angle-down"></i>\
                    								<span></span>\
                    							</div>\
                    							<ul class="dynamicdd-mask-list"></ul>\
                    						</div>'),
                  			container = $('<div class="dynamicdd-hide"></div>'),
                  			wrapper = $select.closest('.dynamicdd-wrapper'),
                  			index = $customSelect.index(),
                  			width = index * 30,
                            selectedValue = 0,
                            list = null;      

                        if(index === 0) {
                            if(wrapper.data('list')) {
                                selectedValue = wrapper.data('list')[0].parentID;
                            }
                        } else {
                            selectedValue = wrapper.find('.dynamicdd:eq('+ (index-1) +') select').val();
                        }
                        
                        if(wrapper.data('drilled') === false) {
                            list = getChildren(wrapper.data('list'));
                        } else {
                            list = getChildren(wrapper.data('list'), selectedValue);
                        }
                  
                  		if (options.mapClass) {                  			
		                    customSelect.addClass($select.attr('class'));
		                }
		                if (options.mapStyle) {
		                    customSelect.attr('style', $select.attr('style'));
		                }         

                        if(wrapper.data('placeholder')) {
                            if(wrapper.data('placeholder') === "All") {
                                var parentId = 0
                                if(index !== 0) {
                                    parentId = $wrapper.find('.dynamicdd:eq('+ (index-1) +') select').val(); 
                                }
                                result += '<option class="selectall" selected value="'+parentId+'">Semua</option>';                                
                            } else {
                                result += '<option selected disabled>'+ wrapper.data('placeholder') +'</option>';                                    
                            }                            
                            
                        }

                        if(list) {                         
                			$.each(list, function(key, val) {
                                    if(!(wrapper.data('placeholder')) && key === 0) {
                                        result += '<option selected value="'+val.id+'">'+val.name+'</option>';
                                    } else {
                                        result += '<option value="'+val.id+'">'+val.name+'</option>';
                                    }                                
                			});
                			$select.append(result);
                		}

                		$customSelect.css({ "width" : "calc(100% - "+width+"px)" });

                		$select.wrap(container);
               			$select.parent().after(customSelect);

                        changed($select, $customSelect);
                		renderList($select);
                        
                    })
                    .on('change.customSelect', function () {  
                        changed($select, $customSelect);
                    })
                    .on('change', function() {
                        if(!($wrapper.data('drilled') === false)) {
                            $select.closest('.dynamicdd').nextAll().remove();

                            list = getChildren($select.closest('.dynamicdd-wrapper').data('list'), $select.val());
                            setName($select, list);
                        }
                    })
                    .trigger('render.customSelect');

								
				$customSelect
					.on('click', '.dynamicdd-mask', function() {
                        var $maskList = $(this).find('.dynamicdd-mask-list'),
                            maskBottom = $customSelect.offset().top + $maskList.outerHeight() + $(this).outerHeight(),
                            viewportHeight = window.innerHeight,
                            maskPosition = '33px';
                        
                        if(maskBottom >= viewportHeight) {
                            maskPosition = 1-($maskList.outerHeight())+'px';
                        }                       

						$('.dynamicdd-mask').not($(this)).find('.dynamicdd-mask-list')
                            .removeClass('open')
                            .removeAttr('style');
                        $(this).find('.dynamicdd-mask-list')
                            .scrollTop(0)
                            .toggleClass('open')
                            .css({'top': maskPosition});
					})
					.on('click', '.dynamicdd-mask-list li', function() {						
						var $selectedList = $(this),
							customSelect = $selectedList.closest('.dynamicdd'),
							list;                                                

                        if($selectedList.hasClass('group') || $selectedList.hasClass('disabled')) {
                            return false;
                        }
                        $select.val($selectedList.data('value'));
                                  
                        $select.trigger('change');
                    })

				$(document).on('click', function(event) {
					if (!$(event.target).closest('.dynamicdd').length) {
					    // Hide the menus.
					    $('.dynamicdd-mask-list').removeClass('open');
					}
				});

            });
        }
    });
})(jQuery);