(function(B){var A=new SCROLL.ExportDialog();
AJS.toInit(function(C){A.init(C,{productName:"Scroll Wiki EclipseHelp Exporter",exporterId:"com.k15t.scroll.scroll-eclipsehelp:eclipsehelp-exporter",pluginKey:"com.k15t.scroll.scroll-eclipsehelp",restBaseUrl:AJS.params.contextPath+"/rest/scroll-eclipsehelp/1.0/",exportTemplateUrl:contextPath+"/plugins/servlet/com.k15t.scroll.eclipsehelp/dialogs?dialogType=export&exporterId=com.k15t.scroll.scroll-eclipsehelp:eclipsehelp-exporter",feedbackLink:"http://support.k15t.com/forums/20155643-scroll-wiki-eclipsehelp-exporter/entries/new",helpUrl:"http://k15t.com/display/EHLP/Get+Help",dialogClass:"k15t-scroll-ehlp"});
AJS.$("#com-k15t-confluence-scroll-ehlp-launcher, .k15t-ehlp-launch-exportui").click(function(D){D.preventDefault();
A.open()
})
})
})(AJS.$);
