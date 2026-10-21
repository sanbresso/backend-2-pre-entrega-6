import {
  listEvents,
  getEventById as getEventByIdService,
  createEvent as createEventService,
  updateEvent as updateEventService,
  changeEventStatus as changeEventStatusService
} from "../services/events.service.js";

export async function getEvents(req, res, next) {
  try {
    const result = await listEvents(req.query, req.user);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getEventById(req, res, next) {
  try {
    const event = await getEventByIdService(
      req.params.id,
      req.user
    );

    return res.status(200).json({
      status: "success",
      payload: event
    });
  } catch (error) {
    next(error);
  }
}


export async function createEvent(req, res, next) {
  try {
    const event = await createEventService(
      req.body,
      req.user.id
    );

    return res.status(201).json({
      status: "success",
      payload: event
    });
  } catch (error) {
    next(error);
  }
}

export async function updateEvent(req, res, next) {
  try {
    const event = await updateEventService(
      req.event,
      req.body
    );

    return res.status(200).json({
      status: "success",
      payload: event
    });
  } catch (error) {
    next(error);
  }
}

export async function changeEventStatus(req, res, next) {
  try {
    const event = await changeEventStatusService(
      req.event,
      req.body?.status
    );

    return res.status(200).json({
      status: "success",
      payload: event
    });
  } catch (error) {
    next(error);
  }
}