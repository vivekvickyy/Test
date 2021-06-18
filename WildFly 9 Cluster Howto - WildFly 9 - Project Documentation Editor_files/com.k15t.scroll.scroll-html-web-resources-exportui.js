(function(B){var A=new SCROLL.ExportDialog();
AJS.toInit(function(C){A.init(C,{productName:"Scroll Wiki HTML Exporter",exporterId:"com.k15t.scroll.scroll-html:html-exporter",pluginKey:"com.k15t.scroll.scroll-html",restBaseUrl:AJS.params.contextPath+"/rest/scroll-html/1.0/",exportTemplateUrl:contextPath+"/plugins/servlet/com.k15t.scroll.html/dialogs?dialogType=export&exporterId=com.k15t.scroll.scroll-html:html-exporter",feedbackLink:"http://support.k15t.com/forums/20155643-scroll-wiki-html-exporter/entries/new",helpUrl:"http://k15t.com/display/HTML/Get+Help",dialogClass:"k15t-scroll-html"});
AJS.$("#com-k15t-confluence-scroll-html-launcher, .k15t-html-launch-exportui").click(function(D){D.preventDefault();
A.open()
})
})
})(AJS.$);
