(function(D){var B=new SCROLL.ExportDialog();
var A=contextPath+"/rest/scroll-epub/1.0/artwork";
var C=function(E,H,G){var F={type:"GET",url:A+"?pageId="+E,contentType:"application/json",success:H,error:G||function(){}};
D.ajax(F)
};
AJS.toInit(function(F){B.init(F,{productName:"Scroll Wiki EPUB Exporter",exporterId:"com.k15t.scroll.scroll-epub:epub-exporter",pluginKey:"com.k15t.scroll.scroll-epub",restBaseUrl:AJS.params.contextPath+"/rest/scroll-epub/1.0/",exportTemplateUrl:contextPath+"/plugins/servlet/com.k15t.scroll.epub/dialogs?dialogType=export&exporterId=com.k15t.scroll.scroll-epub:epub-exporter",feedbackLink:"http://support.k15t.com/forums/20167572-scroll-wiki-epub-exporter",helpUrl:"http://k15t.com/display/EPUB/Get+Help",dialogClass:"k15t-scroll-epub"});
var E=function(){var G=F("#artwork_pulldown");
var H=F("#com-k15t-scroll-export-artwork-item").template();
C(AJS.params.pageId,function(K,L,M){G.find("option").not(".static").remove();
if(K.globalLogo){F.tmpl(H,K.globalLogo).appendTo(G)
}if(K.spaceLogo){F.tmpl(H,K.spaceLogo).appendTo(G)
}var I=K.pageAttachments;
for(var J=0;
I&&J<I.length;
++J){F.tmpl(H,I[J]).appendTo(G)
}})
};
AJS.$("#com-k15t-confluence-scroll-epub-launcher, .k15t-epub-launch-exportui").click(function(H){H.preventDefault();
var G=B.initSettings;
B.initSettings=function(){G.call(B);
E()
};
B.open()
});
F("#artwork_pulldown").die("change").live("change",function(){value=F(this).attr("value");
if(value.length){F("#artwork_preview").attr("src",value);
F("#artwork_preview").show()
}else{F("#artwork_preview").hide()
}})
})
})(AJS.$);
(function(B,F,E,G){var C=function(H){H.removeClass("open");
H.unbind("keydown.pulldown.close");
F("body").unbind("click.pulldown.close");
H.find(".hovered").removeClass("hovered")
};
var D=function(H){H.addClass("open");
var I=H.find(".pulldown-menu");
I.css("top","0");
H.bind("keydown.pulldown.close",function(J){if(J.keyCode===27){J.preventDefault();
J.stopPropagation();
C(H);
A(H)
}});
F("body").bind("click.pulldown.close",function(J){if(H.hasClass("open")){C(H);
A(H)
}})
};
var A=function(J){var M=J.find("label");
var L=M.find("input");
for(var K=0;
K<L.size();
++K){var N=L.eq(K);
var O=N.closest("label");
if(N.is(":checked")){O.addClass("selected")
}else{O.removeClass("selected")
}}var H=J.find(".pulldown-menu");
var I=J.find(".selected");
if(I.size()){var P=I.position();
H.scrollTop(0);
if(!J.hasClass("open")){J.find(".pulldown-menu").css("top",-P.top+"px")
}else{if(J.find(".hovered").size()){P=J.find(".hovered").position()
}H.scrollTop(P.top)
}}};
B.toInit(function(){F("body").delegate("form.k15t .pulldown input","change",function(){var H=F(this).closest(".pulldown");
A(H)
});
F("body").delegate("form.k15t .pulldown","click",function(J){J.stopPropagation();
var H=F(this);
var I=F(J.target);
if(!I.is("input")){if(H.hasClass("open")){C(H)
}else{if(!I.is("input")){D(H);
J.preventDefault()
}}A(H)
}})
});
F("body").delegate("form.k15t .pulldown","keydown.pulldown.keys",function(L){var I=F(this);
var M=I.hasClass("open");
if(L.keyCode===13){L.preventDefault();
L.stopPropagation();
var H=I.find(".hovered");
if(H.size()){I.find(".selected").removeClass("selected");
I.find("input").val([H.find("input").val()])
}I.trigger("click")
}else{if(M){L.preventDefault();
L.stopPropagation();
var K=I.find(".hovered");
if(!K.size()){K=I.find(".selected")
}var J;
if(L.keyCode===40||L.keyCode===9){J=K.next("label");
if(!J.size()){J=K.siblings().eq(0)
}}else{if(M&&L.keyCode===38){J=K.prev("label");
if(!J.size()){J=K.siblings().eq(-1)
}}}K.removeClass("hovered");
if(J){J.addClass("hovered")
}A(I)
}}});
F("body").delegate("form.k15t .pulldown label","mouseenter",function(){var H=F(this);
H.siblings("label").removeClass("hovered");
H.addClass("hovered")
});
E.Pulldown={update:function(H){H=F(H);
if(H.is(".pulldown")){A(H)
}},updateAll:function(){var I=F("form.k15t .pulldown");
for(var H=0;
H<I.size();
++H){A(I.eq(H))
}}}
})(AJS,AJS.$,KJS);
