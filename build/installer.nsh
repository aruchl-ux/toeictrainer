; Extra Start menu shortcut that launches straight into the Office view.
!macro customInstall
  CreateShortCut "$SMPROGRAMS\TOEIC Trainer (Office).lnk" "$INSTDIR\${APP_EXECUTABLE_FILENAME}" "--office" "$INSTDIR\${APP_EXECUTABLE_FILENAME}" 0
!macroend

!macro customUnInstall
  Delete "$SMPROGRAMS\TOEIC Trainer (Office).lnk"
!macroend
