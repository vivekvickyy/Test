AJS.toInit(function(C){var A,E;AJS.DragAndDrop.defaultDropHandler=function(H){if(!AJS.DragAndDropUtils.isGearsInstalledWithPermissions()){AJS.DragAndDropUtils.preventDefault(H);AJS.DragAndDropUtils.stopPropagation(H);return }var G=AJS.DragAndDropUtils.getFilesFromDropEvent(H);if(G&&!!G.length){B();var F=A.upload(G);if(!E){E=new AJS.DragAndDropProgressDialog();E.cancelListeners.push(function(J,I){A.cancel(I.workId)});AJS.DragAndDropUtils.enableDropZoneOn(C("#"+E.id)[0]);E.onShowListeners.push(function(){AJS.DragAndDropUtils.enableDropZoneOn(C(".aui-blanket")[0])})}E.show();C.each(F,function(J,I){E.render(I)});AJS.DragAndDropUtils.getDesktopInstance().setDropEffect(H,"copy")}};function D(){var H=document.createElement("div");H.setAttribute("id","filuploadShim");document.body.appendChild(H);var G=new plupload.Uploader({runtimes:"html5",dragdrop:true,drop_element:C("body")[0],browse_button:H,multipart:false,max_file_size:+AJS.params.globalSettingsAttachmentMaxSize}),F=function(){E=new AJS.DragAndDropProgressDialog()};E=null;G.init();AJS.DragAndDrop.defaultDropHandler=null;G.bind("FilesAdded",function(I,L){G.stop();!E&&F();for(var J=0,K=L.length;J<K;J++){E.render({workId:L[J].id,status:L[J].status,file:L[J]})}G.start()});G.bind("BeforeUpload",function(I,K){var J=AJS.DragAndDropUtils.base+AJS.General.getContextPath()+"/plugins/drag-and-drop/upload.action";var L=AJS.params.pageId!=0?{pageId:AJS.params.pageId}:{draftType:AJS.params.draftType},M=K.name.substr(K.name.lastIndexOf(".")+1);L.filename=K.name;L.size=K.size;L.mimeType=plupload.mimeTypes[M.toLowerCase()]||"application/octet-stream";I.settings.url=plupload.buildUrl(J,L);E.cancelListeners.push(function(P,N){var O=I.getFile(N.workId);O&&I.cancelFile(O)});E.show()});G.bind("UploadProgress",function(I,J){E.renderUpdateToBytesUploaded(J.id,J.loaded,J.size);E.disableCloseButton(AJS.DragAndDrop.i18n["upload.in.progress"])});G.bind("FileUploaded",function(I,K,J){E.renderComplete(K.id)});G.bind("FilesRemoved",function(I,K){for(var J=0,L=K.length;
J<L;J++){if(K[J].status==plupload.CANCELLED){E.renderCancelled(K[J].id)}}});G.bind("Error",function(J,K){var I,L;if(K.response){try{I=AJS.$.parseJSON(K.response);L=I.actionErrors[0]}catch(M){L=K.message}}else{L=K.message;if(K.code==plupload.FILE_SIZE_ERROR){L=AJS.format(AJS.DragAndDrop.i18n["validation.file.too.large"],AJS.DragAndDropUtils.niceSize(K.file.size).toString(),AJS.DragAndDropUtils.niceSize(AJS.params.globalSettingsAttachmentMaxSize).toString());!E&&F();E.render({workId:K.file.id,status:K.file.status,file:K.file});E.show()}}E.renderError(K.file.id,L)});G.bind("UploaderIdle",function(){if(!G.total.queued){E.enableCloseButton(AJS.DragAndDrop.i18n["dialog.button.done"]);if(!E.hasErrors()){setTimeout(function(){E.hide();E.clearRenderOutput();window.location.reload()},1000)}}})}function B(){if(!A){A=new AJS.GearsUploadManager(AJS.DragAndDropUtils.getCachingUrl("/download/resources/com.atlassian.confluence.plugins.drag-and-drop:upload-worker/upload-worker.js"));A.addOnErrorHandler(function(F){F.data.actionErrors&&F.data.actionErrors[0]&&E.renderError(F.workId,F.data.actionErrors[0])});A.addOnProgressHandler(function(F){E.renderUpdateToBytesUploaded(F.workId,F.bytesUploaded,F.fileSize)});A.addOnProgressHandler(function(){E.disableCloseButton(AJS.DragAndDrop.i18n["upload.in.progress"])});A.addOnSuccessHandler(function(F){E.renderComplete(F.workId)});A.addOtherMessageHandler(function(F){AJS.log("Received message from worker "+F.sender+": \n"+F.body)});A.addOnIdleHandler(function(){if(E.hasErrors()){E.enableCloseButton(AJS.DragAndDrop.i18n["dialog.button.done"])}else{E.closeButtonText(AJS.DragAndDrop.i18n["dialog.button.reload"]);setTimeout(function(){window.location.reload()},1000)}});A.addOnCancelHandler(function(F){E.renderCancelled(F)})}}AJS.DragAndDropUtils.hasXhrSupport&&D()});
AJS.toInit(function(A){AJS.DragAndDropUtils.init(function(B){var C=A("body")[0];if(!B){AJS.DragAndDropUtils.enableDropZoneOn(C)}})});