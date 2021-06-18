(function(B){var A=new SCROLL.ExportDialog();
AJS.toInit(function(C){A.init(C,{productName:"Scroll Wiki PDF Exporter",exporterId:"com.k15t.scroll.scroll-pdf:pdf-exporter",pluginKey:"com.k15t.scroll.scroll-pdf",restBaseUrl:AJS.params.contextPath+"/rest/scroll-pdf/1.0/",exportTemplateUrl:contextPath+"/plugins/servlet/com.k15t.scroll.pdf/dialogs?dialogType=export&exporterId=com.k15t.scroll.scroll-pdf:pdf-exporter",helpUrl:"http://k15t.com/display/PDF/Get+Help",dialogClass:"k15t-scroll-pdf"});
AJS.$("#com-k15t-confluence-scroll-pdf-launcher, .k15t-pdf-launch-exportui").click(function(D){D.preventDefault();
A.open()
})
})
})(AJS.$);
