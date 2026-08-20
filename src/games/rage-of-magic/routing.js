function nextRouteAfterPlay(s) {
  const e = (t, i = !1) => ({
    route: t,
    resetIntroLoop: i,
  });
  return s.mode === 'demo'
    ? s.enemiesNull
      ? e('splash')
      : s.abortPressed || s.escapePressed
        ? e('splash', !0)
        : e('none')
    : s.mode === 'show'
      ? s.enemiesNull || s.abortPressed || s.escapePressed
        ? e('show-chapters')
        : e('none')
      : s.mode === 'preview'
        ? s.abortPressed || s.escapePressed
          ? e('preview-exit')
          : e('none')
        : s.mode === 'versus'
          ? s.helpPressed
            ? e('help-keys')
            : s.playersNull
              ? e('end-versus')
              : s.escapePressed
                ? e('pause')
                : e('none')
          : s.mode === 'arena'
            ? s.helpPressed
              ? e('help-keys')
              : s.gameStatus === 1
                ? e('end-arena')
                : s.escapePressed
                  ? e('pause')
                  : e('none')
            : s.mode === 'arcade'
              ? s.helpPressed
                ? e('help-keys')
                : s.gameStatus >= 1
                  ? e('end-arcade')
                  : s.escapePressed
                    ? e('pause')
                    : e('none')
              : s.mode === 'movie'
                ? s.gameStatus >= 1
                  ? e(s.gameReplay ? 'movie-chapters' : 'movie-skip')
                  : s.escapePressed
                    ? e('movie-skip-question')
                    : e('none')
                : s.mode === 'tutorial' && s.gameChapter === -1
                  ? s.escapePressed
                    ? e('tutorial-exit')
                    : e('none')
                  : s.helpPressed
                    ? e('help-keys')
                    : s.escapePressed
                      ? e('pause')
                      : e('none');
}
export { nextRouteAfterPlay };
