AJS.toInit(function(){AJS.$("table.attachments tr").each(function(A,B){AJS.$(B).find("td.attachment-actions a").each(function(C,D){if(AJS.$(D).attr("href").indexOf("/plugins/gliffy/view")!=-1){AJS.$(B).find("td.filename-column span").removeClass("icon-file-xml icon-file-unknown").addClass("gliffy-document-icon").attr("title","Gliffy File").text("Gliffy File")
}})
})
});
AJS.toInit(function(){if(AJS.version>="3.0"){var A=AJS.$("#poweredby:visible");
if(A.length>0){A.before(AJS.template.load("gliffy-footer-webpanel"))
}}});
