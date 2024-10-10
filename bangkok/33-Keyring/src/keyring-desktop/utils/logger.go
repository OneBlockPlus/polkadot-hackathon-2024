package utils

import (
	"os"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gopkg.in/natefinch/lumberjack.v2"
)

var Logger *zap.Logger
var Sugar *zap.SugaredLogger

func SetupLog() {
	filePath, err := LogFilePath()
	if err != nil {
		os.Exit(1)
	}

	w := zapcore.AddSync(&lumberjack.Logger{
		Filename:   filePath,
		MaxSize:    100, // megabytes
		MaxBackups: 3,
		MaxAge:     28, // days
	})
	encoder := zap.NewProductionEncoderConfig()
	encoder.EncodeTime = zapcore.ISO8601TimeEncoder
	core := zapcore.NewCore(
		zapcore.NewJSONEncoder(encoder),
		w,
		zap.InfoLevel,
	)
	Logger = zap.New(core)
	Sugar = Logger.Sugar()
}
