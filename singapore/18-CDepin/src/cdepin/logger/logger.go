package logger

import (
	"os"
	"sync"

	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
)

var (
	logger *Logger
)

type Logger struct {
	//txLogger
	loggers map[string]*logrus.Logger
	rw      *sync.RWMutex
}

func GetGlobalLogger() *Logger {
	if logger == nil {
		InitGlobalLogger()
	}
	return logger
}

func InitGlobalLogger() *Logger {
	logger = &Logger{
		loggers: make(map[string]*logrus.Logger),
		rw:      &sync.RWMutex{},
	}
	return logger
}

func (lg *Logger) RegisterLogger(name, fpath, formatter string) (*logrus.Logger, error) {

	logger := logrus.New()
	switch formatter {
	case "Json", "JSON", "json":
		logger.SetFormatter(&logrus.JSONFormatter{})
	default:
		logger.SetFormatter(&logrus.TextFormatter{})
	}

	if fpath != "" {
		f, err := os.OpenFile(fpath, os.O_APPEND|os.O_RDWR|os.O_CREATE, 0755)
		if err != nil {
			return nil, errors.Wrap(err, "register logger error")
		}
		logger.SetOutput(f)
	}
	lg.rw.Lock()
	lg.loggers[name] = logger
	lg.rw.Unlock()
	logger.Info("register a logger: ", name)
	return logger, nil
}

func (lg *Logger) GetLogger(name string) *logrus.Logger {
	lg.rw.RLock()
	defer lg.rw.RUnlock()
	return lg.loggers[name]
}

func GetLogger(name string) *logrus.Logger {
	if logger != nil {
		logger.rw.RLock()
		defer logger.rw.RUnlock()
		return logger.loggers[name]
	}
	return nil
}
