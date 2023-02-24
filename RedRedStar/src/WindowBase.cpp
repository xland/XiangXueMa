#include "../include/RRS/App.h"
#include "../include/RRS/WindowBase.h"
#include "include/core/SkCanvas.h"
#include "include/core/SkSurface.h"
#include "../include/RRS/Element.h"
#include "../include/RRS/Layout.h"
#include <Yoga.h>

namespace RRS 
{
	WindowBase::WindowBase()
		:backendContext{nullptr},hglrc{nullptr},directContext{nullptr}
		,Layout{ new RRS::Layout() } ,Hwnd{nullptr}
		,BackgroundColor{ RRS::GetColor(255, 255, 255, 255) }	{
		App::Get()->Windows.push_back(this);
	}
	bool WindowBase::Load() 
	{
		auto flag = createNativeWindow(); 
		if (!flag) return flag;
		initSurface();
		OnLoad();
		return true;
	}
	void WindowBase::Close()
	{
		auto flag = OnClose();
		if (flag) {
			App::Get()->RemoveWindow(this);
			delete Layout;
			disposeSurfaceResource();
			DestroyWindow(Hwnd);
		}
		OnClosed();
	}
	void WindowBase::paint() {
		Layout->CalculateLayout(Width,Height);
		SkSurface* surface = getSurface(Width, Height);
		if (surface == nullptr) {
			return;
		}
		auto canvas = surface->getCanvas();
		canvas->clear(BackgroundColor);
		for (auto element : Children)
		{
			element->Paint(canvas);
		}
		surface->flushAndSubmit();
		HDC dc = GetDC(Hwnd);
		SwapBuffers(dc);
		ReleaseDC(Hwnd, dc);
		delete surface;
		//todo destroy context
	}
	void WindowBase::Show() 
	{
		ShowWindow(Hwnd, SW_SHOW);
	}
	void WindowBase::Hide() 
	{
		//todo
	}
	void WindowBase::AddElement(Element* element)
	{
		Layout->AddChild(element->Layout);
		Children.push_back(element);
	}
}